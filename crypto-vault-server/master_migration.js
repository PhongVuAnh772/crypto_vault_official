require('dotenv').config();
const db = require('./src/utils/db');
const fs = require('fs');
const path = require('path');

async function masterMigration() {
    try {
        console.log('🚀 BẮT ĐẦU MASTER MIGRATION (Khởi tạo toàn bộ Database)...');

        // Danh sách các file SQL cần chạy theo thứ tự
        const sqlFiles = ['nuclear_reset.sql', 'ultimate_schema.sql'];

        for (const file of sqlFiles) {
            console.log(`📄 Đang thực thi: ${file}...`);
            const sqlPath = path.join(__dirname, file);
            if (!fs.existsSync(sqlPath)) {
                console.warn(`⚠️ Cảnh báo: Không tìm thấy file ${file}, bỏ qua.`);
                continue;
            }
            const sql = fs.readFileSync(sqlPath, 'utf8');
            await db.query(sql);
            console.log(`✅ Hoàn thành ${file}`);
        }

        console.log('--- 🏁 TẤT CẢ CÁC BẢNG ĐÃ ĐƯỢC KHỞI TẠO THÀNH CÔNG ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ LỖI TRONG QUÁ TRÌNH MIGRATION:', err);
        process.exit(1);
    }
}

masterMigration();
