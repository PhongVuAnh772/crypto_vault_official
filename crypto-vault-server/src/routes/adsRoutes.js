const express = require('express');
const router = express.Router();
const adsService = require('../services/adsService');
const logger = require('../utils/logger');

/**
 * [POST] /api/ads/reward/callback
 * Server-Side Verification (SSV) callback from Ad Network (AdMob, Unity, etc.)
 */
router.post('/reward/callback', async (req, res) => {
  try {
    const { userId, type, rewardValue, externalId, signature } = req.body;

    // ⛔ SECURITY: Kiểm tra chữ ký từ Ad Network ở đây (Cần Public Key của Net)
    // if (!verifySignature(req.body, signature)) return res.status(403).send('Invalid Signature');

    if (type === 'REWARDED_AD') {
      // User xem xong clip -> Tạo discount spread
      await adsService.createBenefit(userId, 0.3); // Giảm 30% spread
      return res.json({ success: true, message: 'Benefit created' });
    }

    if (type === 'OFFERWALL') {
      // User làm task xong -> Cộng tiền
      await adsService.creditOfferwallReward(userId, rewardValue, externalId);
      return res.json({ success: true, message: 'Reward credited' });
    }

    res.status(400).json({ error: 'Unknown ad type' });
  } catch (err) {
    logger.error('Ads Callback Error', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * [GET] /api/ads/benefits/active
 * Kiểm tra xem User có lợi ích nào đang active không
 */
router.get('/benefits/active', async (req, res) => {
  try {
    const { userId } = req.query; // Thực tế lấy từ req.user (JWT)
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const benefit = await adsService.getActiveBenefit(userId);
    res.json({ hasBenefit: !!benefit, benefit });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch benefits' });
  }
});

module.exports = router;
