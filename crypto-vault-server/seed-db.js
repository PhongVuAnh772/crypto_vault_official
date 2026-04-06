const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  await client.connect();
  console.log('Seeding initial data...');

  try {
    // 1. Insert Chains
    const chainEth = await client.query(`
      INSERT INTO chains (name, chain_key, architecture, vm, is_active)
      VALUES ('Ethereum', 'eth', 'EVM', 'EVM', true)
      ON CONFLICT (chain_key) DO UPDATE SET is_active = EXCLUDED.is_active
      RETURNING id;
    `);

    const chainBtc = await client.query(`
      INSERT INTO chains (name, chain_key, architecture, vm, is_active)
      VALUES ('Bitcoin', 'btc', 'UTXO', 'NONE', true)
      ON CONFLICT (chain_key) DO UPDATE SET is_active = EXCLUDED.is_active
      RETURNING id;
    `);

    const chainTon = await client.query(`
      INSERT INTO chains (name, chain_key, architecture, vm, is_active)
      VALUES ('The Open Network', 'ton', 'ACCOUNT', 'TVM', true)
      ON CONFLICT (chain_key) DO UPDATE SET is_active = EXCLUDED.is_active
      RETURNING id;
    `);

    const ethId = chainEth.rows[0].id;
    const btcId = chainBtc.rows[0].id;
    const tonId = chainTon.rows[0].id;

    // 2. Insert Token Standards
    await client.query(`
      INSERT INTO token_standards (name, chain_id)
      VALUES 
        ('ERC20', '${ethId}'),
        ('JETTON', '${tonId}')
      ON CONFLICT DO NOTHING;
    `);

    // 3. Insert Tokens
    const tokens = await client.query(`
      INSERT INTO tokens (chain_id, symbol, name, decimals, is_native)
      VALUES 
        ('${ethId}', 'ETH', 'Ethereum', 18, true),
        ('${ethId}', 'USDT', 'Tether USD', 6, false),
        ('${btcId}', 'BTC', 'Bitcoin', 8, true),
        ('${tonId}', 'TON', 'Toncoin', 9, true)
      ON CONFLICT DO NOTHING
      RETURNING id, symbol;
    `);

    // 4. Set visibility and priority
    for (const row of tokens.rows) {
      await client.query(`
        INSERT INTO supported_tokens (token_id, priority, is_visible)
        VALUES ('${row.id}', 1, true)
        ON CONFLICT (token_id) DO UPDATE SET is_visible = true;
      `);
    }

    // 5. Insert App Config
    await client.query(`
      INSERT INTO app_config (key, value)
      VALUES ('features', '{"p2pEnabled": true, "swapEnabled": true, "bridgeEnabled": false, "maintenanceMode": false}')
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
    `);

    // 6. Insert RPCs
    await client.query(`
      INSERT INTO rpc_endpoints (chain_id, url, priority)
      VALUES 
        ('${ethId}', 'https://mainnet.infura.io/v3/redx', 1),
        ('${tonId}', 'https://toncenter.com/api/v2/jsonRPC', 1)
      ON CONFLICT DO NOTHING;
    `);
    
    // 7. Insert Profiles (Contacts)
    await client.query(`
      INSERT INTO profiles (user_id, nickname, avatar_url, is_verified)
      VALUES 
        (gen_random_uuid(), 'Emily Smith', 'https://i.pravatar.cc/150?u=emily', true),
        (gen_random_uuid(), 'Olivia Wilson', 'https://i.pravatar.cc/150?u=olivia', true),
        (gen_random_uuid(), 'James Davis', 'https://i.pravatar.cc/150?u=james', false),
        (gen_random_uuid(), 'Robert Smith', 'https://i.pravatar.cc/150?u=robert', true),
        (gen_random_uuid(), 'William Smith', 'https://i.pravatar.cc/150?u=william', false)
      ON CONFLICT DO NOTHING;
    `);

    console.log('✅ Seeding completed!');
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
  } finally {
    await client.end();
  }
}

seed();
