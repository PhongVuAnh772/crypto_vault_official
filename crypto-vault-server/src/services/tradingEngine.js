const db = require('../utils/db');

class TradingEngine {
    constructor() {
        // No longer using this.positions = [];
    }

    async openPosition(userId, symbol, side, entryPrice, leverage, margin, amount, orderType = 'MARKET') {
        const parsedEntry = parseFloat(entryPrice);
        const positionSize = parseFloat(amount) || (parseFloat(margin) * parseInt(leverage));
        if (!userId) {
            throw new Error('Authenticated user is required');
        }
        const uid = userId;
        const normalizedType = String(orderType || 'MARKET').toUpperCase();

        try {
            if (normalizedType === 'LIMIT') {
                const insertOrderRes = await db.query(
                    `INSERT INTO trading_orders (user_id, symbol, side, type, price, amount, status, leverage, margin)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
                    [uid, symbol.toUpperCase(), side === 'LONG' ? 'BUY' : 'SELL', 'LIMIT', parsedEntry, positionSize, 'PENDING', leverage, margin]
                );
                return { success: true, order: insertOrderRes.rows[0], message: 'Lệnh Limit đã được đặt' };
            }

            // [MARKET ORDER LOGIC - Immediate Fill]
            // 1. Check for existing position to average or reduce
            const checkRes = await db.query(
                'SELECT * FROM trading_positions WHERE user_id = $1 AND symbol = $2 AND status = \'OPEN\'',
                [uid, symbol]
            );

            if (checkRes.rows.length > 0) {
                const pos = checkRes.rows[0];
                // ... (Existing averaging/reduction logic stays here)

                if (pos.side === side) {
                    // [ARCHITECT] Average Entry Price Logic
                    const totalAmount = parseFloat(pos.amount) + positionSize;
                    const totalCost = (parseFloat(pos.amount) * parseFloat(pos.entry_price)) + (positionSize * parsedEntry);
                    const avgEntryPrice = totalCost / totalAmount;
                    const totalMargin = parseFloat(pos.margin) + parseFloat(margin);

                    // Re-calculate Liq Price
                    const maintenanceMargin = 0.005;
                    const newLiqPrice = side === 'LONG'
                        ? avgEntryPrice * (1 - (1 / parseInt(leverage)) + maintenanceMargin)
                        : avgEntryPrice * (1 + (1 / parseInt(leverage)) - maintenanceMargin);

                    const updateRes = await db.query(
                        `UPDATE trading_positions 
                         SET amount = $1, entry_price = $2, margin = $3, liq_price = $4, updated_at = NOW() 
                         WHERE id = $5 RETURNING *`,
                        [totalAmount, avgEntryPrice, totalMargin, newLiqPrice, pos.id]
                    );
                    return updateRes.rows[0];
                } else {
                    // [ARCHITECT] Counter-side logic (Partial/Full close)
                    if (positionSize >= parseFloat(pos.amount)) {
                        await db.query('UPDATE trading_positions SET status = \'CLOSED\', updated_at = NOW() WHERE id = $1', [pos.id]);
                        const remainder = positionSize - parseFloat(pos.amount);
                        if (remainder > 0.001) {
                            return await this.openPosition(uid, symbol, side, entryPrice, leverage, margin * (remainder / positionSize), remainder);
                        }
                        return null;
                    } else {
                        const newAmount = parseFloat(pos.amount) - positionSize;
                        const newMargin = parseFloat(pos.margin) - parseFloat(margin);
                        const updateRes = await db.query(
                            'UPDATE trading_positions SET amount = $1, margin = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
                            [newAmount, newMargin, pos.id]
                        );
                        return updateRes.rows[0];
                    }
                }
            }

            // 2. Create new position
            const maintenanceMargin = 0.005;
            const liqPrice = side === 'LONG'
                ? parsedEntry * (1 - (1 / parseInt(leverage)) + maintenanceMargin)
                : parsedEntry * (1 + (1 / parseInt(leverage)) - maintenanceMargin);

            const insertRes = await db.query(
                `INSERT INTO trading_positions (user_id, symbol, side, entry_price, leverage, margin, amount, liq_price)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
                [uid, symbol, side, parsedEntry, leverage, margin, positionSize, liqPrice]
            );

            // Record order history
            await db.query(
                'INSERT INTO trading_orders (user_id, symbol, side, type, price, amount, status, leverage, margin) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
                [uid, symbol.toUpperCase(), side === 'LONG' ? 'BUY' : 'SELL', 'MARKET', parsedEntry, positionSize, 'FILLED', leverage, margin]
            );

            return insertRes.rows[0];
        } catch (err) {
            console.error('[TradingEngine] DB Error:', err);
            throw err;
        }
    }

    async closePosition(id) {
        await db.query('UPDATE trading_positions SET status = \'CLOSED\', updated_at = NOW() WHERE id = $1', [id]);
    }

    async getPositionById(userId, id) {
        const res = await db.query(
            'SELECT * FROM trading_positions WHERE user_id = $1 AND id = $2 AND status = \'OPEN\'',
            [userId, id]
        );
        return res.rows[0] || null;
    }

    async getPositions(userId) {
        if (!userId) {
            throw new Error('Authenticated user is required');
        }
        const res = await db.query(
            'SELECT * FROM trading_positions WHERE user_id = $1 AND status = \'OPEN\' ORDER BY created_at DESC',
            [userId]
        );
        return res.rows;
    }

    async getOpenOrders(userId) {
        if (!userId) {
            throw new Error('Authenticated user is required');
        }
        const res = await db.query(
            `SELECT * FROM trading_orders
             WHERE user_id = $1 AND status = 'PENDING'
             ORDER BY created_at DESC`,
            [userId]
        );
        return res.rows;
    }

    async cancelOrder(userId, id) {
        const res = await db.query(
            `UPDATE trading_orders
             SET status = 'CANCELLED'
             WHERE user_id = $1 AND id = $2 AND status = 'PENDING'
             RETURNING *`,
            [userId, id]
        );
        return res.rows[0] || null;
    }

    // [ARCHITECT] The Matching Engine
    async checkLimitOrders(symbol, currentPrice) {
        const price = parseFloat(currentPrice);
        try {
            // Find orders that can be filled
            // Buy orders: currentPrice <= orderPrice
            // Sell orders: currentPrice >= orderPrice
            const pendingRes = await db.query(
                `SELECT * FROM trading_orders 
                 WHERE symbol = $1 AND status = 'PENDING' 
                 AND (
                    (side = 'BUY' AND price >= $2) OR 
                    (side = 'SELL' AND price <= $3)
                 )`,
                [symbol, price, price]
            );

            for (const order of pendingRes.rows) {
                console.log(`[MATCHING ENGINE] Filling Order ${order.id} for user ${order.user_id}`);
                
                // 1. Mark as filled
                await db.query('UPDATE trading_orders SET status = \'FILLED\' WHERE id = $1', [order.id]);

                // 2. Open actual position
                const side = order.side === 'BUY' ? 'LONG' : 'SHORT';
                await this.openPosition(
                    order.user_id,
                    order.symbol,
                    side,
                    order.price,
                    order.leverage || 1,
                    order.margin || ((parseFloat(order.amount) * parseFloat(order.price)) / (order.leverage || 1)),
                    order.amount,
                    'MARKET'
                );
                
                // Return user ID to notify via WS in server.js
                return order.user_id; 
            }
        } catch (err) {
            console.error('[MatchingEngine] Error:', err);
        }
        return null;
    }
}

module.exports = new TradingEngine();
