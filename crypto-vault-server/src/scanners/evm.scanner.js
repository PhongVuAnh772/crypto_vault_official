const { Worker } = require('bullmq');
const { ethers } = require('ethers');
const db = require('../utils/db');
const logger = require('../utils/logger');
const { redisConnection, depositProcessQueue } = require('./queue.setup');

// Giới hạn ví dụ: URL RPC cho mạng Polygon hoặc BSC
const rpcUrl = process.env.EVM_RPC_URL || 'https://cloudflare-eth.com';
const provider = new ethers.JsonRpcProvider(rpcUrl);

// Chữ ký Event Transfer Chuẩn của ERC20 Token (hash của "Transfer(address,address,uint256)")
const TRANSFER_EVENT_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

/**
 * Worker chạy ngầm bóc tách từng Block trong chuỗi Blockchain EVM.
 */
const evmScanWorker = new Worker('scan-evm-block', async job => {
  const { blockNumber, chainId } = job.data;
  logger.info(`[EVM SCANNER] Bắt đầu scan khối: ${blockNumber}`);

  let block;
  try {
     block = await provider.getBlock(blockNumber, true); // true: tải kèm list danh sách giao dịch
  } catch(e) {
     throw new Error(`RPC Lỗi Mất Tín Hiệu: Lỗi đọc block ${blockNumber}`);
  }
  
  if (!block) throw new Error("Block Not Found Anomalies");

  // Load danh sách ví CryptoVault trên chuỗi EVM lên Cache Redis Set để so sánh tốc độ O(1)
  // Thực tế ở production => Chạy Lệnh Sinter hoặc Load toàn bộ wallet_id, address, user_id map lên Redis khi server boot 
  const localDbWalletsResult = await db.query(`SELECT id as wallet_id, address, user_id FROM wallets WHERE chain_id = $1`, [chainId]);
  const systemWallets = new Map();
  localDbWalletsResult.rows.forEach(w => systemWallets.set(w.address.toLowerCase(), w));

  if (systemWallets.size === 0) return; // Nếu sàn chả có cái ví nào, chẳng rảnh đi scan làm gì

  // 1. Phân Tích Đồng Native Coin (BNB, ETH)
  for (const tx of block.prefetchedTransactions || []) {
    const toAddress = tx.to ? tx.to.toLowerCase() : null;
    if (toAddress && systemWallets.has(toAddress)) {
        // Nạn nhân đã Deposit! Bắn vào Queue Xử lý Nạp Tiền
        const wallet = systemWallets.get(toAddress);
        await depositProcessQueue.add('deposit', {
             userId: wallet.user_id,
             walletId: wallet.wallet_id,
             chainId,
             tokenId: null, // Hoặc lấy chain Native Token ID
             txHash: tx.hash,
             amount: tx.value.toString(),
             isConfirmed: false // Yêu cầu chờ qua 6 Blocks Confirmation Manager
        });
        logger.info(`[EVM SCANNER] 💥 Tìm Thấy Giao Dịch Nạp Native ETH/BNB: ${tx.hash}`);
    }
  }

  // 2. Phân Tích Hợp Đồng Thông Minh (ERC20 Tokens Transfer)
  const logs = await provider.getLogs({ fromBlock: blockNumber, toBlock: blockNumber });
  for (const log of logs) {
    if (log.topics[0] === TRANSFER_EVENT_TOPIC) {
      // Decode địa chỉ người nhận từ dữ liệu Topics 2
      const toAddressExotic = '0x' + log.topics[2].slice(26).toLowerCase();
      
      if (systemWallets.has(toAddressExotic)) {
         const wallet = systemWallets.get(toAddressExotic);
         const tokenContract = log.address.toLowerCase();
         
         // Kiểm tra xem Token này sàn mình có List (Niêm yết) không?
         const tokenRs = await db.query(`SELECT id FROM tokens WHERE contract_address = $1`, [tokenContract]);
         if (tokenRs.rows.length === 0) continue; // Scam token không hỗ trợ, kệ tụi nó gửi lộn

         await depositProcessQueue.add('deposit', {
             userId: wallet.user_id,
             walletId: wallet.wallet_id,
             chainId,
             tokenId: tokenRs.rows[0].id,
             txHash: log.transactionHash,
             amount: BigInt(log.data).toString(), 
             isConfirmed: false
         });
         logger.info(`[EVM SCANNER] 💥 Tìm Thấy Nạp Token ERC20: ${log.transactionHash}`);
      }
    }
  }

  // 3. Quét Hoàn Lỗi -> Lưu vào Database State Tránh Scan Lại
  await db.query(`
    INSERT INTO chain_scanner_state (chain_id, last_scanned_block) 
    VALUES ($1, $2) 
    ON CONFLICT (chain_id) DO UPDATE SET last_scanned_block = EXCLUDED.last_scanned_block, updated_at = NOW()
  `, [chainId, blockNumber]);

}, { connection: redisConnection, concurrency: 10 });

module.exports = { evmScanWorker };
