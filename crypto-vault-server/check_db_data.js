const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://postgres.zmsgkyiqikhtwwsjhoxn:vuanhphong2209@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres",
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkData() {
  try {
    const res = await pool.query("SELECT user_name, content, created_at FROM social_posts WHERE user_id = 'binance-bot' ORDER BY created_at DESC LIMIT 5;");
    console.log('--- BINANCE BOT POSTS ---');
    if (res.rows.length === 0) {
      console.log('No data found for binance-bot.');
    } else {
      res.rows.forEach((row, i) => {
        console.log(`${i+1}. [${row.created_at}] ${row.user_name}: ${row.content.substring(0, 100)}...`);
      });
    }
    
    const total = await pool.query("SELECT COUNT(*) FROM social_posts;");
    console.log(`\nTotal posts in social_posts: ${total.rows[0].count}`);
    
    await pool.end();
  } catch (err) {
    console.error('Database error:', err);
    process.exit(1);
  }
}

checkData();
