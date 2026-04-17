const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// This should be in your .env
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/**
 * Verify Telegram Login hash
 * Data includes: id, first_name, last_name, username, photo_url, auth_date, hash
 */
router.post('/verify', async (req, res) => {
    try {
        const { authData, walletAddress } = req.body;
        const { hash, ...data } = authData;

        // 1. Check if BOT_TOKEN is set
        if (!BOT_TOKEN) {
            return res.status(500).json({ success: false, error: 'Bot token not configured' });
        }

        // 2. Verify hash
        // Data check-string: key=value sorted alphabetically by key
        const dataCheckString = Object.keys(data)
            .sort()
            .map(key => `${key}=${data[key]}`)
            .join('\n');

        const secretKey = crypto.createHash('sha256').update(BOT_TOKEN).digest();
        const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

        if (hmac !== hash) {
            return res.status(403).json({ success: false, error: 'Verification failed' });
        }

        // 3. Check expiration (e.g., 24 hours)
        const now = Math.floor(Date.now() / 1000);
        if (now - data.auth_date > 86400) {
            return res.status(403).json({ success: false, error: 'Auth data expired' });
        }

        // 4. Save to DB (link telegram_id with wallet_address)
        // pool.query('INSERT INTO user_telegram (wallet_address, telegram_id, telegram_user) VALUES ($1, $2, $3) ON CONFLICT...', [walletAddress, data.id, data]);

        res.json({ 
            success: true, 
            user: {
                id: data.id,
                username: data.username,
                firstName: data.first_name,
                photoUrl: data.photo_url
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
