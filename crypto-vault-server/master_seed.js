require('dotenv').config();
const db = require('./src/utils/db');
const crypto = require('crypto');

// Helper để biến 24-char Hex (Mongo) thành 32-char Hex (UUID format)
const toUUID = (mongoId) => {
    // Nếu là 24 ký tự, thêm 8 số 0 ở đầu
    const hex = mongoId.padStart(32, '0');
    // Chèn dấu gạch ngang: 8-4-4-4-12
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
};

const SEED_DATA = {
  chains: [
    { id: toUUID('66da762f291e0ce47c6d8d56'), name: 'Bitcoin', chain_key: 'btc', architecture: 'UTXO', vm: 'NONE', is_active: true, 
      metadata: { slip0044: 0, explorer_url: 'https://blockstream.info', icon_url: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' } },
    { id: toUUID('66da778a291e0ce47c6d8d5c'), name: 'Ethereum', chain_key: 'eth', architecture: 'EVM', vm: 'EVM', is_active: true, 
      metadata: { slip0044: 60, chainId: 1, explorer_url: 'https://etherscan.io', icon_url: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' } },
    { id: toUUID('66e3bd3544fc7ffae93443c2'), name: 'TON', chain_key: 'ton', architecture: 'ACCOUNT', vm: 'TVM', is_active: true, 
      metadata: { slip0044: 607, explorer_url: 'https://tonscan.org', icon_url: 'https://cryptologos.cc/logos/toncoin-ton-logo.png' } },
    { id: toUUID('66ed55fb499e454b70e63326'), name: 'BNB Smart Chain', chain_key: 'bsc', architecture: 'EVM', vm: 'EVM', is_active: true, 
      metadata: { slip0044: 714, chainId: 56, explorer_url: 'https://bscscan.com', icon_url: 'https://cryptologos.cc/logos/bnb-bnb-logo.png' } },
    { id: toUUID('66ed5939499e454b70e63360'), name: 'Polygon', chain_key: 'polygon', architecture: 'EVM', vm: 'EVM', is_active: true, 
      metadata: { slip0044: 966, chainId: 137, explorer_url: 'https://polygonscan.com', icon_url: 'https://cryptologos.cc/logos/polygon-matic-logo.png' } }
  ],
  tokens: [
    { chain_id: toUUID('66da762f291e0ce47c6d8d56'), name: 'Bitcoin', symbol: 'BTC', decimals: 8, is_native: true, contract_address: '' },
    { chain_id: toUUID('66da778a291e0ce47c6d8d5c'), name: 'Ethereum', symbol: 'ETH', decimals: 18, is_native: true, contract_address: '' },
    { chain_id: toUUID('66e3bd3544fc7ffae93443c2'), name: 'Toncoin', symbol: 'TON', decimals: 9, is_native: true, contract_address: '' },
    { chain_id: toUUID('66ed55fb499e454b70e63326'), name: 'BNB', symbol: 'BNB', decimals: 18, is_native: true, contract_address: '' },
    { chain_id: toUUID('66ed5939499e454b70e63360'), name: 'Polygon', symbol: 'POL', decimals: 18, is_native: true, contract_address: '' },
    { chain_id: toUUID('66da778a291e0ce47c6d8d5c'), name: 'Tether USD', symbol: 'USDT', decimals: 6, is_native: false, contract_address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' }
  ],
  profiles: [
    { nickname: 'Emily Smith', avatar_url: 'https://i.pravatar.cc/150?u=emily', is_verified: true },
    { nickname: 'Olivia Wilson', avatar_url: 'https://i.pravatar.cc/150?u=olivia', is_verified: true },
    { nickname: 'James Davis', avatar_url: 'https://i.pravatar.cc/150?u=james', is_verified: false },
    { nickname: 'Robert Smith', avatar_url: 'https://i.pravatar.cc/150?u=robert', is_verified: true }
  ],
  p2p_ads: [
    { type: 'BUY', symbol: 'USDT', price: 25450, min_limit: 100, max_limit: 5000 },
    { type: 'SELL', symbol: 'BTC', price: 1750000000, min_limit: 0.001, max_limit: 0.1 }
  ]
};

async function masterSeed() {
  try {
    console.log('--- MASTER SEED STARTING ---');
    
    // 1. Clear old data (Order is important for FKs)
    await db.query('DELETE FROM p2p_orders');
    await db.query('DELETE FROM p2p_ads');
    await db.query('DELETE FROM supported_tokens');
    await db.query('DELETE FROM tokens');
    await db.query('DELETE FROM rpc_endpoints');
    await db.query('DELETE FROM chains');
    await db.query('DELETE FROM profiles');

    console.log('1. Seeding Chains...');
    for (const c of SEED_DATA.chains) {
      await db.query(`INSERT INTO chains (id, name, chain_key, architecture, vm, metadata, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7)`, 
      [c.id, c.name, c.chain_key, c.architecture, c.vm, JSON.stringify(c.metadata), c.is_active]);
    }

    console.log('2. Seeding Tokens & Visibility...');
    const tokenMap = {};
    for (const t of SEED_DATA.tokens) {
      const res = await db.query(`INSERT INTO tokens (chain_id, name, symbol, decimals, is_native, contract_address, is_active) VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING id`, 
      [t.chain_id, t.name, t.symbol, t.decimals, t.is_native, t.contract_address]);
      
      const tokenId = res.rows[0].id;
      tokenMap[t.symbol] = tokenId;
      await db.query(`INSERT INTO supported_tokens (token_id, priority, is_visible) VALUES ($1, 1, true)`, [tokenId]);
    }

    console.log('3. Seeding RPCs...');
    await db.query(`INSERT INTO rpc_endpoints (chain_id, url) VALUES ($1, $2)`, [SEED_DATA.chains[1].id, 'https://rpc.ankr.com/eth']);

    console.log('4. Seeding User Profiles...');
    for (const p of SEED_DATA.profiles) {
      await db.query(`INSERT INTO profiles (user_id, nickname, avatar_url, is_verified) VALUES ($1, $2, $3, $4)`, 
      [crypto.randomUUID(), p.nickname, p.avatar_url, p.is_verified]);
    }

    console.log('5. Seeding P2P Ads...');
    for (const ad of SEED_DATA.p2p_ads) {
      const tokenId = tokenMap[ad.symbol];
      if (tokenId) {
        await db.query(`INSERT INTO p2p_ads (user_id, type, token_id, chain_id, price, min_limit, max_limit) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [crypto.randomUUID(), ad.type, tokenId, SEED_DATA.chains[1].id, ad.price, ad.min_limit, ad.max_limit]);
      }
    }

    console.log('6. App Config...');
    await db.query(`INSERT INTO app_config (key, value) VALUES ('features', $1) ON CONFLICT (key) DO UPDATE SET value = $1`, 
    [JSON.stringify({ p2pEnabled: true, swapEnabled: true, bridgeEnabled: false, maintenanceMode: false })]);

    console.log('--- ✅ MASTER SEED COMPLETED SUCCESSFULLY ---');
  } catch (err) {
    console.error('❌ SEED ERROR:', err);
  } finally {
    process.exit();
  }
}

masterSeed();
