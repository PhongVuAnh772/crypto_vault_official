const express = require('express');
const router = express.Router();
const db = require('../utils/db');

// Features Config
router.get('/config', async (req, res) => {
  res.json({
    features: {
      p2p: true,
      swap: true,
      bridge: true,
      staking: false
    }
  });
});

// Assets/Tokens for mobile app
router.get('/assets', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT t.*, c.name as chain_name, c.chain_key 
      FROM tokens t 
      JOIN chains c ON t.chain_id = c.id 
      WHERE t.is_active = true AND c.is_active = true
      ORDER BY t.created_at ASC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Networks/Chains for mobile app
router.get('/networks', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM chains WHERE is_active = true');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Mobile Legacy Compatibility Endpoint
 * Returns protocols with tokens in the format defined in account.type.ts
 */
router.get('/mobile/protocols/get-supported-tokens', async (req, res) => {
  try {
    // 1. Fetch active chains
    const chainsRes = await db.query('SELECT * FROM chains WHERE is_active = true');
    const chains = chainsRes.rows;

    // 2. Fetch active tokens for these chains
    const tokensRes = await db.query('SELECT * FROM tokens WHERE is_active = true');
    const allTokens = tokensRes.rows;

    // 3. Map to mobile format
    const protocols = chains.map(chain => {
      const chainTokens = allTokens.filter(t => t.chain_id === chain.id);

      // Filter native token for this chain
      const native = chainTokens.find(t => t.is_native) || {
        name: chain.name,
        symbol: chain.chain_key.toUpperCase(),
        decimals: 18,
        contract_address: ''
      };

      // rpc details - provide multiple high-reliability defaults
      let rpcUrls = [];
      const dbRpc = chain.metadata?.rpc_url;
      if (dbRpc) rpcUrls.push(dbRpc);

      const chainKey = chain.chain_key.toLowerCase();
      const rpcMap = {
        eth: [
          'https://eth.llamarpc.com', 
          'https://rpc.ankr.com/eth', 
          'https://cloudflare-eth.com',
          'https://eth-mainnet.public.blastapi.io',
          'https://1rpc.io/eth'
        ],
        bsc: [
          'https://binance.llamarpc.com', 
          'https://bsc-dataseed.binance.org/', 
          'https://bsc.publicnode.com',
          'https://bsc-dataseed1.defibit.io/',
          'https://1rpc.io/bnb'
        ],
        polygon: [
          'https://polygon.llamarpc.com', 
          'https://polygon-rpc.com', 
          'https://rpc-mainnet.maticvigil.com',
          'https://polygon.meowrpc.com',
          'https://1rpc.io/matic',
          'https://polygon-bor-rpc.publicnode.com'
        ],
        arbitrum: [
          'https://arbitrum.llamarpc.com', 
          'https://arb1.arbitrum.io/rpc', 
          'https://1rpc.io/arb',
          'https://arbitrum.meowrpc.com',
          'https://arbitrum-one.publicnode.com'
        ],
        optimism: [
          'https://optimism.llamarpc.com', 
          'https://mainnet.optimism.io', 
          'https://1rpc.io/op',
          'https://optimism.meowrpc.com',
          'https://optimism.publicnode.com'
        ],
        base: [
          'https://base.llamarpc.com', 
          'https://mainnet.base.org', 
          'https://1rpc.io/base',
          'https://base.meowrpc.com',
          'https://base.publicnode.com'
        ],
        avax: [
          'https://avax.llamarpc.com', 
          'https://api.avax.network/ext/bc/C/rpc',
          'https://avalanche.publicnode.com',
          'https://1rpc.io/avax/c'
        ],
        btc: ['https://blockstream.info/api/', 'https://mempool.space/api/', 'https://blockchain.info/'],
        ton: ['https://toncenter.com/api/v2/jsonRPC', 'https://ton.access.orbs.network/v1/mainnet/ton-mainnet/jsonRPC', 'https://tonapi.io/json-rpc']
      };

      const fallbacks = rpcMap[chainKey] || [];
      rpcUrls = [...new Set([...rpcUrls, ...fallbacks])]; // Unique RPCs

      // beneficiary addresses requested by user
      let beneficiaryAddress = '0xDa716C028aEc9C186B9A5120424f2bcF43179fBd'; // Default to ETH for EVM
      if (chain.chain_key === 'btc') beneficiaryAddress = 'bc1qk8c4t2hj0mm2plw0gdavq6cga43g06s842zlun';
      else if (chain.vm === 'NONE' && chain.chain_key !== 'btc') beneficiaryAddress = 'bc1qk8c4t2hj0mm2plw0gdavq6cga43g06s842zlun'; // Fallback for other non-vm? 
      // Keep it specific for now
      if (chain.vm === 'TVM' || chain.chain_key === 'ton') beneficiaryAddress = 'UQDReToXDqKE_vUYNrrQDr3oleOpv1AYx7_6jsJa8yItCjua';

      return {
        _id: chain.id,
        name: chain.name,
        symbol: chain.chain_key.toUpperCase(),
        VM: chain.vm === 'TVM' ? 'Ton' : (chain.vm === 'NONE' ? 'Bitcoin' : chain.vm),
        slip0044: chain.metadata?.slip0044 !== undefined ? parseInt(chain.metadata.slip0044) : 60,
        chainId: chain.metadata?.chainId || (chain.architecture === 'EVM' ? 1 : null),
        status: 'active',
        blockExplorerUrl: chain.metadata?.explorer_url || '',
        rpcUrl: rpcUrls[0] || '',
        rpcUrls: rpcUrls,
        coinTransferFee: parseFloat(chain.coin_transfer_fee) || 0.001,
        tokenTransferFee: parseFloat(chain.token_transfer_fee) || 0.001,
        nftTransferFee: parseFloat(chain.nft_transfer_fee) || 0.001,
        createdAt: chain.created_at,
        updatedAt: chain.updated_at,
        logo: chain.metadata?.icon_url || 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
        isDefault: true,
        isTestnet: chain.is_testnet,
        beneficiary: {
          status: 'approved',
          walletAddress: beneficiaryAddress
        },
        nativeToken: {
          name: native.name,
          symbol: native.symbol,
          decimal: native.decimals,
          address: native.contract_address || ''
        },
        supportedToken: chainTokens.map(t => ({
          _id: t.id,
          name: t.name,
          symbol: t.symbol,
          contractAddress: t.contract_address || '',
          decimal: t.decimals,
          logo: t.metadata?.icon_url || '',
          isNativeToken: t.is_native
        }))
      };
    });


    console.log(`Sending ${protocols.length} active protocols to mobile.`);
    res.json(protocols);
  } catch (err) {
    console.error('Legacy Mobile API Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// More legacy endpoints for mobile
router.get('/mobile/protocols', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM chains WHERE is_active = true');
    const items = result.rows.map(c => ({
      _id: c.id,
      name: c.name,
      symbol: c.chain_key.toUpperCase(),
      VM: c.vm === 'TVM' ? 'Ton' : (c.vm === 'NONE' ? 'Bitcoin' : c.vm),
      slip0044: c.metadata?.slip0044 || 60,
      chainId: c.metadata?.chainId || 1,
      status: 'active',
      logo: c.metadata?.icon_url || '',
      price: 0 // Mock price or fetch from cache
    }));
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk sync wallet addresses from mobile app
router.post('/wallets/sync', async (req, res) => {
  try {
    const { userId, wallets } = req.body;
    if (!userId || !Array.isArray(wallets)) {
      return res.status(400).json({ success: false, error: 'Missing userId or invalid wallets array' });
    }

    const results = [];
    for (const wallet of wallets) {
      const { chainId, address, metadata } = wallet;
      if (!chainId || !address) continue;

      const result = await db.query(
        `INSERT INTO wallets (user_id, chain_id, address, metadata, wallet_type) 
         VALUES ($1, $2, $3, $4, (SELECT architecture FROM chains WHERE id = $2)) 
         ON CONFLICT (chain_id, address) DO UPDATE SET metadata = $4, updated_at = NOW()
         RETURNING *`,
        [userId, chainId, address, metadata || {}]
      );
      results.push(result.rows[0]);
    }

    res.json({ success: true, count: results.length, data: results });
  } catch (err) {
    console.error('Wallet sync error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
