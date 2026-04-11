const db = require('./src/utils/db');
const CryptoJS = require('crypto-js');

const hashPassword = (password) => {
  return CryptoJS.SHA256(password).toString();
};

async function createAdmin() {
    try {
        const email = 'admin@cryptovault.com';
        const password = 'admin123456';
        const pwdHash = hashPassword(password);
        
        await db.query(`
            INSERT INTO admins (email, password_hash, role, is_active)
            VALUES ($1, $2, 'super_admin', true)
            ON CONFLICT (email) DO NOTHING;
        `, [email, pwdHash]);
        
        console.log('✅ Admin account created:');
        console.log('Email:', email);
        console.log('Password:', password);
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to create admin:', err);
        process.exit(1);
    }
}

createAdmin();
