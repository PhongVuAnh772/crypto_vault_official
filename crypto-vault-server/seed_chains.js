require('dotenv').config({ path: __dirname + '/.env' });
const db = require('./src/utils/db');

const SEED_DATA = {
  chains: [
    {
      id: '66da762f291e0ce47c6d8d56',
      name: 'Bitcoin',
      chain_key: 'btc',
      architecture: 'UTXO',
      vm: 'NONE',
      is_active: true,
      metadata: {
        slip0044: 0,
        explorer_url: 'https://blockstream.info',
        rpc_url: '',
        icon_url: 'https://red-x-dev-public.s3.ap-northeast-1.amazonaws.com/token/20241106-042111-bitcoin.png'
      }
    },
    {
      id: '66da778a291e0ce47c6d8d5c',
      name: 'Ethereum',
      chain_key: 'eth',
      architecture: 'EVM',
      vm: 'EVM',
      is_active: true,
      metadata: {
        slip0044: 60,
        chainId: 1,
        explorer_url: 'https://etherscan.io',
        rpc_url: 'https://rpc.ankr.com/eth',
        icon_url: 'https://red-x-dev-public.s3.ap-northeast-1.amazonaws.com/token/20241106-042132-ethereum.png'
      }
    },
    {
      id: '66e3bd3544fc7ffae93443c2',
      name: 'TON',
      chain_key: 'ton',
      architecture: 'ACCOUNT',
      vm: 'TVM',
      is_active: true,
      metadata: {
        slip0044: 607,
        explorer_url: 'https://tonscan.org',
        rpc_url: 'https://toncenter.com/api/v2/jsonRPC',
        icon_url: 'https://red-x-dev-public.s3.ap-northeast-1.amazonaws.com/token/20241106-042148-ton.png'
      }
    },
    {
      id: '66ed55fb499e454b70e63326',
      name: 'BNB Smart Chain',
      chain_key: 'bsc',
      architecture: 'EVM',
      vm: 'EVM',
      is_active: true,
      metadata: {
        slip0044: 714,
        chainId: 56,
        explorer_url: 'https://bscscan.com',
        rpc_url: 'https://bsc-dataseed.binance.org/',
        icon_url: 'https://red-x-dev-public.s3.ap-northeast-1.amazonaws.com/token/20241106-042120-bsc%20testnet.png'
      }
    },
    {
      id: '66ed5939499e454b70e63360',
      name: 'Polygon',
      chain_key: 'polygon',
      architecture: 'EVM',
      vm: 'EVM',
      is_active: true,
      metadata: {
        slip0044: 966,
        chainId: 137,
        explorer_url: 'https://polygonscan.com',
        rpc_url: 'https://polygon-rpc.com',
        icon_url: 'https://red-x-dev-public.s3.ap-northeast-1.amazonaws.com/token/20241106-041952-polygon.png'
      }
    }
  ],
  tokens: [
    // Native tokens for each chain
    { chain_id: '66da762f291e0ce47c6d8d56', name: 'Bitcoin', symbol: 'BTC', decimals: 8, is_native: true, contract_address: '' },
    { chain_id: '66da778a291e0ce47c6d8d5c', name: 'Ethereum', symbol: 'ETH', decimals: 18, is_native: true, contract_address: '' },
    { chain_id: '66e3bd3544fc7ffae93443c2', name: 'Toncoin', symbol: 'TON', decimals: 9, is_native: true, contract_address: '' },
    { chain_id: '66ed55fb499e454b70e63326', name: 'BNB', symbol: 'BNB', decimals: 18, is_native: true, contract_address: '' },
    { chain_id: '66ed5939499e454b70e63360', name: 'Polygon', symbol: 'POL', decimals: 18, is_native: true, contract_address: '' },
    
    // Some common tokens
    { chain_id: '66da778a291e0ce47c6d8d5c', name: 'Tether USD', symbol: 'USDT', decimals: 6, is_native: false, contract_address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' }
  ]
};

async function seed() {
  try {
    console.log('Cleaning existing data to avoid conflicts...');
    await db.query('DELETE FROM tokens');
    await db.query('DELETE FROM chains');

    console.log('Seeding chains with original IDs...');
    for (const chain of SEED_DATA.chains) {
      await db.query(`
        INSERT INTO chains (id, name, chain_key, architecture, vm, metadata, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [chain.id, chain.name, chain.chain_key, chain.architecture, chain.vm, JSON.stringify(chain.metadata), chain.is_active]);
      console.log(`- Seeded chain: ${chain.name} (${chain.id})`);
    }

    console.log('Seeding tokens...');
    for (const token of SEED_DATA.tokens) {
      await db.query(`
        INSERT INTO tokens (chain_id, name, symbol, decimals, is_native, contract_address, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, true)
      `, [token.chain_id, token.name, token.symbol, token.decimals, token.is_native, token.contract_address]);
    }

    console.log('Seeding complete!');
  } catch (err) {
    console.error('Seed Error:', err);
  } finally {
    process.exit();
  }
}

seed();
