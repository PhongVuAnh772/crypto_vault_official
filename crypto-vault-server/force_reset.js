require('dotenv').config();
const db = require('./src/utils/db');

async function forceReset() {
    const tables = [
        'audit_logs', 'admins', 'app_config', 'supported_tokens', 'ledger_entries', 'balances', 
        'transaction_jobs', 'deposits', 'withdrawals', 'p2p_escrows', 'p2p_orders', 'p2p_ads', 
        'transactions', 'wallets', 'rpc_endpoints', 'token_standards', 'tokens', 'chains', 'profiles', 'users'
    ];

    console.log('☢️  FORCE RESET STARTING...');
    for (const table of tables) {
        try {
            await db.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
            console.log(`🗑️  Dropped: ${table}`);
        } catch (err) {
            console.warn(`⚠️  Failed to drop ${table}:`, err.message);
        }
    }
    console.log('✅ FORCE RESET COMPLETED.');
    process.exit(0);
}

forceReset();
