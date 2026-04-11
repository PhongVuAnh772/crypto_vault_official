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

      return {
        _id: chain.id,
        name: chain.name,
        symbol: chain.chain_key.toUpperCase(),
        VM: chain.vm === 'TVM' ? 'Ton' : (chain.vm === 'NONE' ? 'Bitcoin' : chain.vm),
        slip0044: chain.metadata?.slip0044 !== undefined ? parseInt(chain.metadata.slip0044) : 60,
        chainId: chain.metadata?.chainId || (chain.architecture === 'EVM' ? 1 : null),
        status: 'active',
        blockExplorerUrl: chain.metadata?.explorer_url || '',
        rpcUrl: chain.metadata?.rpc_url || '',
        coinTransferFee: 0.001,
        tokenTransferFee: 0.001,
        nftTransferFee: 0.001,
        createdAt: chain.created_at,
        updatedAt: chain.updated_at,
        logo: chain.metadata?.icon_url || 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
        isDefault: true,
        beneficiary: {
          status: 'approved',
          walletAddress: '0x0000000000000000000000000000000000000000' // Default placeholder for mobile security check
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

// Register wallet address from mobile app
router.post('/wallets', async (req, res) => {
  try {
    const { userId, chainId, address, metadata } = req.body;
    if (!userId || !chainId || !address) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const result = await db.query(
      `INSERT INTO wallets (user_id, chain_id, address, metadata) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (chain_id, address) DO UPDATE SET metadata = $4, updated_at = NOW()
       RETURNING *`,
      [userId, chainId, address, metadata || {}]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
