const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://postgres.zmsgkyiqikhtwwsjhoxn:vuanhphong2209@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres",
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkData() {
  try {
    const res = await pool.query("SELECT id, user_avatar, images, type FROM social_posts LIMIT 5;");
    console.log('--- IMAGE DATA CHECK ---');
    res.rows.forEach((row, i) => {
      console.log(`${i+1}. ID: ${row.id}`);
      console.log(`   Type: ${row.type}`);
      console.log(`   Avatar: ${row.user_avatar}`);
      console.log(`   Images (Raw): ${JSON.stringify(row.images)}`);
      console.log(`   Images (Type): ${typeof row.images}`);
      console.log('---');
    });
    
    await pool.end();
  } catch (err) {
    console.error('Database error:', err);
    process.exit(1);
  }
}

checkData();
