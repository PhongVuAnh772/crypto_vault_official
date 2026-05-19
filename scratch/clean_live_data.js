require('dotenv').config({ path: './crypto-vault-server/.env' });
const db = require('../crypto-vault-server/src/utils/db');

async function cleanLiveData() {
    try {
        console.log('Cleaning up all live data...');
        const result = await db.query("DELETE FROM social_posts WHERE type = 'live'");
        console.log(`Successfully deleted ${result.rowCount} live sessions.`);
        process.exit(0);
    } catch (error) {
        console.error('Failed to clean data:', error);
        process.exit(1);
    }
}

cleanLiveData();
