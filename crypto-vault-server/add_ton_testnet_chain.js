require("dotenv").config({ path: __dirname + "/.env" });
const db = require("./src/utils/db");

const TON_TESTNET_CHAIN_KEY = "ton_testnet";

async function ensureTonTestnetChain() {
  const metadata = {
    slip0044: 607,
    explorer_url: "https://testnet.tonviewer.com",
    rpc_url: "https://testnet.toncenter.com/api/v2/jsonRPC",
    icon_url:
      "https://red-x-dev-public.s3.ap-northeast-1.amazonaws.com/token/20241106-042148-ton.png",
  };

  const chainRes = await db.query(
    `
    INSERT INTO chains (name, chain_key, architecture, vm, is_active, is_testnet, metadata)
    VALUES ($1, $2, 'ACCOUNT', 'TVM', true, true, $3::jsonb)
    ON CONFLICT (chain_key)
    DO UPDATE SET
      name = EXCLUDED.name,
      architecture = EXCLUDED.architecture,
      vm = EXCLUDED.vm,
      is_active = EXCLUDED.is_active,
      is_testnet = EXCLUDED.is_testnet,
      metadata = EXCLUDED.metadata
    RETURNING id, name, chain_key, is_testnet
    `,
    ["TON Testnet", TON_TESTNET_CHAIN_KEY, JSON.stringify(metadata)]
  );

  const chain = chainRes.rows[0];
  if (!chain) throw new Error("Failed to upsert TON Testnet chain");

  await db.query(
    `
    INSERT INTO tokens (chain_id, symbol, name, decimals, contract_address, is_native, is_active)
    VALUES ($1, 'TON', 'Toncoin Testnet', 9, '', true, true)
    ON CONFLICT (chain_id, symbol, contract_address)
    DO UPDATE SET
      name = EXCLUDED.name,
      decimals = EXCLUDED.decimals,
      is_native = EXCLUDED.is_native,
      is_active = EXCLUDED.is_active
    `,
    [chain.id]
  );

  console.log("TON testnet ready:", chain);
}

ensureTonTestnetChain()
  .catch((err) => {
    console.error("add_ton_testnet_chain failed:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.pool.end();
  });
