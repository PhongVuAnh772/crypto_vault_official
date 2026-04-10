// Simulated Trading Engine for CEX/DEX Hybrid Backend
const crypto = require('crypto');

class TradingEngine {
    constructor() {
        // In a real system, this would be Redis/PostgreSQL
        this.positions = [];
    }

    openPosition(userId, symbol, side, entryPrice, leverage, margin, amount) {
        // Find existing position for the same symbol
        const existingPosIdx = this.positions.findIndex(p => p.userId === (userId || 'mock-user-id') && p.symbol === symbol);
        const positionSize = amount || (margin * leverage);
        const parsedEntry = parseFloat(entryPrice);

        if (existingPosIdx >= 0) {
            const pos = this.positions[existingPosIdx];

            if (pos.side === side) {
                // Nhồi lệnh (Add to position): Average the entry price
                const totalAmount = pos.amount + positionSize;
                const totalCost = (pos.amount * pos.entryPrice) + (positionSize * parsedEntry);
                const avgEntryPrice = totalCost / totalAmount;
                const totalMargin = pos.margin + parseFloat(margin);

                pos.amount = totalAmount;
                pos.entryPrice = avgEntryPrice;
                pos.margin = totalMargin;
                // Cập nhật lại Liq Price
                const maintenanceMargin = 0.005;
                pos.liqPrice = side === 'LONG'
                    ? avgEntryPrice * (1 - (1 / pos.leverage) + maintenanceMargin)
                    : avgEntryPrice * (1 + (1 / pos.leverage) - maintenanceMargin);

                return pos;
            } else {
                // Đánh ngược chiều (Partial / Full Close or Flip)
                if (positionSize >= pos.amount) {
                    // Đóng vị thế hiện tại. Nếu dư thì tạo vị thế ngược lại. (Tạm thời cứ đóng hẳn)
                    this.positions.splice(existingPosIdx, 1);
                    const remainder = positionSize - pos.amount;
                    if (remainder > 0.001) {
                        return this.openPosition(userId, symbol, side, entryPrice, leverage, margin * (remainder / positionSize), remainder);
                    }
                    return null; // Position completely closed
                } else {
                    // Đóng một phần
                    pos.amount -= positionSize;
                    pos.margin -= parseFloat(margin);
                    return pos;
                }
            }
        }

        // Tạo vị thế mới
        const maintenanceMargin = 0.005; // 0.5% Maint. margin
        let liqPrice = 0;
        if (side === 'LONG') {
            liqPrice = parsedEntry * (1 - (1 / leverage) + maintenanceMargin);
        } else {
            liqPrice = parsedEntry * (1 + (1 / leverage) - maintenanceMargin);
        }

        const newPos = {
            id: crypto.randomUUID(),
            userId: userId || 'mock-user-id',
            symbol,
            side,
            entryPrice: parsedEntry,
            leverage: parseInt(leverage),
            margin: parseFloat(margin),
            amount: parseFloat(positionSize),
            liqPrice: liqPrice,
            status: 'OPEN',
            createdAt: new Date().toISOString()
        };

        this.positions.unshift(newPos);
        return newPos;
    }

    closePosition(id) {
        this.positions = this.positions.filter(p => p.id !== id);
    }

    getPositions(userId = 'mock-user-id') {
        return this.positions.filter(p => p.userId === userId);
    }
}

module.exports = new TradingEngine();
