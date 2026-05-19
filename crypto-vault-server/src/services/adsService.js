const db = require('../utils/db');
const logger = require('../utils/logger');

const isValidUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || ''),
  );

class AdsService {
  /**
   * Tạo lợi ích (giảm spread) khi người dùng xem xong Rewarded Ad
   */
  async createBenefit(userId, value = 0.3, durationMinutes = 10) {
    try {
      const expiresAt = new Date(Date.now() + durationMinutes * 60000);
      
      const res = await db.pool.query(`
        INSERT INTO ad_benefits (user_id, type, value, status, expires_at)
        VALUES ($1, 'SPREAD_DISCOUNT', $2, 'ACTIVE', $3)
        RETURNING *
      `, [userId, value, expiresAt]);

      return res.rows[0];
    } catch (err) {
      logger.error(`[AdsService] createBenefit failed: ${err.message}`);
      throw err;
    }
  }

  /**
   * Lấy lợi ích còn hiệu lực cho User
   */
  async getActiveBenefit(userId) {
    try {
      const res = await db.pool.query(`
        SELECT * FROM ad_benefits 
        WHERE user_id = $1 AND status = 'ACTIVE' AND expires_at > NOW()
        ORDER BY created_at DESC LIMIT 1
      `, [userId]);

      return res.rows[0];
    } catch (err) {
      logger.error(`[AdsService] getActiveBenefit failed: ${err.message}`);
      throw err;
    }
  }

  /**
   * Đánh dấu lợi ích đã sử dụng
   */
  async markBenefitUsed(benefitId) {
    try {
      await db.pool.query(`
        UPDATE ad_benefits SET status = 'USED' WHERE id = $1
      `, [benefitId]);
    } catch (err) {
      logger.error(`[AdsService] markBenefitUsed failed: ${err.message}`);
    }
  }

  /**
   * Ghi nhận phần thưởng từ Offerwall
   * @param {string} userId UUID của user
   * @param {number} amount Số lượng token được thưởng
   * @param {string} externalId ID duy nhất từ Ad Network (tránh duplicate)
   */
  async creditOfferwallReward(userId, amount, externalId, metadata = {}) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Kiểm tra idempotency (external_id)
      const existing = await client.query('SELECT id FROM ad_rewards WHERE external_id = $1', [externalId]);
      if (existing.rows.length > 0) {
        logger.warn(`[AdsService] Double callback for externalId: ${externalId}`);
        await client.query('ROLLBACK');
        return;
      }

      // 2. Lưu record phần thưởng
      await client.query(`
        INSERT INTO ad_rewards (user_id, amount, type, external_id, metadata)
        VALUES ($1, $2, 'OFFERWALL', $3, $4)
      `, [userId, amount, externalId, JSON.stringify(metadata)]);

      // 3. Chỉ cộng số dư nếu userId là UUID hợp lệ với schema balances/transactions hiện tại
      if (isValidUuid(userId)) {
        const tokenRes = await client.query("SELECT id FROM tokens WHERE symbol = 'USDT' LIMIT 1");
        if (tokenRes.rows.length > 0) {
          const tokenId = tokenRes.rows[0].id;
          
          await client.query(`
            INSERT INTO balances (user_id, token_id, available_balance)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, token_id) 
            DO UPDATE SET available_balance = balances.available_balance + $3, updated_at = NOW()
          `, [userId, tokenId, amount]);

          await client.query(`
            INSERT INTO transactions (user_id, token_id, type, status, amount, metadata)
            VALUES ($1, $2, 'DEPOSIT', 'COMPLETED', $3, $4)
          `, [userId, tokenId, amount, JSON.stringify({ source: 'OFFERWALL', externalId })]);
        }
      } else {
        logger.warn(`[AdsService] Skip balance credit because userId is not UUID: ${userId}`);
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      logger.error(`[AdsService] creditOfferwallReward failed: ${err.message}`);
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = new AdsService();
