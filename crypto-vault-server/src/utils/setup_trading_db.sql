-- Create Trading Schema for CryptoVault
-- This script sets up tables for positions, orders and balances

CREATE TABLE IF NOT EXISTS trading_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(10) NOT NULL, -- 'LONG' or 'SHORT'
    entry_price DECIMAL(38, 18) NOT NULL,
    leverage INTEGER NOT NULL DEFAULT 1,
    margin DECIMAL(38, 18) NOT NULL,
    amount DECIMAL(38, 18) NOT NULL,
    liq_price DECIMAL(38, 18),
    status VARCHAR(20) DEFAULT 'OPEN', -- 'OPEN', 'CLOSED', 'LIQUIDATED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trading_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(10) NOT NULL, -- 'BUY', 'SELL'
    type VARCHAR(20) NOT NULL, -- 'MARKET', 'LIMIT', 'STOP_LOSS'
    price DECIMAL(38, 18),
    amount DECIMAL(38, 18) NOT NULL,
    leverage INTEGER NOT NULL DEFAULT 1,
    margin DECIMAL(38, 18) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'FILLED', -- 'PENDING', 'FILLED', 'CANCELLED'
    pnl DECIMAL(38, 18) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE trading_orders ADD COLUMN IF NOT EXISTS leverage INTEGER NOT NULL DEFAULT 1;
ALTER TABLE trading_orders ADD COLUMN IF NOT EXISTS margin DECIMAL(38, 18) DEFAULT 0;
ALTER TABLE trading_orders ALTER COLUMN leverage SET DEFAULT 1;

-- Index for fast lookup of active positions
CREATE INDEX IF NOT EXISTS idx_positions_user_status ON trading_positions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_user ON trading_orders(user_id);
