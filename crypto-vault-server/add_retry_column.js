require('dotenv').config();
const db = require('./src/utils/db');

async function migrate() {
    try {
        console.log('🔄 Đang bổ sung cột next_retry_at vào bảng transaction_jobs...');
        
        await db.query(`
            ALTER TABLE transaction_jobs 
            ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ DEFAULT NOW(),
            ADD COLUMN IF NOT EXISTS retry_count INT DEFAULT 0;
        `);

        console.log('✅ Đã bổ sung cột thành công!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Lỗi khi cập nhật Schema:', err.message);
        process.exit(1);
    }
}

migrate();
