require('dotenv').config();
const db = require('./src/utils/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        console.log('🚀 Bắt đầu chạy Migration SQL...');
        const sqlPath = path.join(__dirname, 'admin_schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        await db.query(sql);
        console.log('✅ Đã khởi tạo các bảng: admins, audit_logs, app_config thành công!');

        // Sau khi tạo bảng xong, tự động tạo luôn tài khoản admin mặc định
        const CryptoJS = require('crypto-js');
        const email = 'admin@cryptovault.com';
        const password = 'admin123456';
        const pwdHash = CryptoJS.SHA256(password).toString();

        await db.query(`
            INSERT INTO admins (email, password_hash, role, is_active)
            VALUES ($1, $2, 'super_admin', true)
            ON CONFLICT (email) DO NOTHING;
        `, [email, pwdHash]);
        
        console.log('👤 Tài khoản Admin mặc định:');
        console.log('   Email:', email);
        console.log('   Pass:', password);
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Lỗi thực thi Migration:', err);
        process.exit(1);
    }
}

runMigration();
