-- ===============================================
-- ADS SYSTEM SCHEMA
-- ===============================================

DO $$ BEGIN
    CREATE TYPE ad_benefit_type AS ENUM ('SPREAD_DISCOUNT', 'FEE_REDUCTION');
    CREATE TYPE ad_reward_type AS ENUM ('OFFERWALL', 'REWARDED_AD');
    CREATE TYPE ad_benefit_status AS ENUM ('ACTIVE', 'USED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Bảng lưu trữ lợi ích từ việc xem quảng cáo (Rewaded Ads)
CREATE TABLE IF NOT EXISTS ad_benefits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type ad_benefit_type DEFAULT 'SPREAD_DISCOUNT',
    value NUMERIC(10, 4) NOT NULL, -- Ví dụ: 0.3 (30% giảm bớt spread)
    status ad_benefit_status DEFAULT 'ACTIVE',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bảng lưu trữ phần thưởng từ Offerwall
CREATE TABLE IF NOT EXISTS ad_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(36, 18) NOT NULL,
    type ad_reward_type DEFAULT 'OFFERWALL',
    external_id VARCHAR(255) UNIQUE NOT NULL, -- ID từ Ad Network để tránh trùng lặp
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Đánh index cho hiệu năng
CREATE INDEX IF NOT EXISTS idx_ad_benefits_user_status ON ad_benefits(user_id, status, expires_at);
CREATE INDEX IF NOT EXISTS idx_ad_rewards_user ON ad_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_rewards_external ON ad_rewards(external_id);
