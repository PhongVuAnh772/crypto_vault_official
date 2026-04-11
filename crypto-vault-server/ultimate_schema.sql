-- ===============================================
-- 0. KHỞI TẠO ENUMS & TYPES
-- ===============================================
DO $$ BEGIN
    CREATE TYPE architecture_type AS ENUM ('EVM', 'UTXO', 'ACCOUNT', 'OTHER');
    CREATE TYPE vm_type AS ENUM ('EVM', 'TVM', 'SVM', 'MOVE', 'NONE');
    CREATE TYPE tx_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');
    CREATE TYPE tx_type AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'TRADE', 'FEE', 'P2P_ESCROW', 'P2P_RELEASE', 'SWAP');
    CREATE TYPE ledger_entry_type AS ENUM ('CREDIT', 'DEBIT');
    CREATE TYPE job_status AS ENUM ('QUEUED', 'RUNNING', 'SUCCESS', 'FAILED', 'RETRYING');
    CREATE TYPE p2p_order_status AS ENUM ('PENDING', 'PAID', 'COMPLETED', 'CANCELLED', 'DISPUTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ===============================================
-- 1. CORE SYSTEM
-- ===============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ext_user_id VARCHAR(255) UNIQUE NOT NULL,
    kyc_level INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    nickname VARCHAR(100),
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    chain_key VARCHAR(50) UNIQUE NOT NULL,
    architecture architecture_type NOT NULL DEFAULT 'EVM',
    vm vm_type DEFAULT 'NONE',
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chain_id UUID REFERENCES chains(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    name VARCHAR(100),
    decimals INT DEFAULT 18,
    contract_address VARCHAR(255),
    is_native BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(chain_id, symbol, contract_address)
);

CREATE TABLE IF NOT EXISTS supported_tokens (
    token_id UUID PRIMARY KEY REFERENCES tokens(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS rpc_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chain_id UUID REFERENCES chains(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, 
    chain_id UUID REFERENCES chains(id),
    address VARCHAR(255) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(chain_id, address)
);

-- ===============================================
-- 2. P2P MARKETPLACE
-- ===============================================
CREATE TABLE IF NOT EXISTS p2p_ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(10) CHECK (type IN ('BUY', 'SELL')),
    token_id UUID NOT NULL REFERENCES tokens(id),
    chain_id UUID NOT NULL REFERENCES chains(id),
    price DECIMAL(36, 18) NOT NULL,
    min_limit DECIMAL(36, 18) NOT NULL,
    max_limit DECIMAL(36, 18) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS p2p_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID NOT NULL REFERENCES p2p_ads(id),
    token_id UUID NOT NULL REFERENCES tokens(id),
    chain_id UUID NOT NULL REFERENCES chains(id),
    seller_id UUID NOT NULL,
    buyer_id UUID NOT NULL,
    amount DECIMAL(36, 18) NOT NULL,
    price DECIMAL(36, 18) NOT NULL,
    status p2p_order_status DEFAULT 'PENDING',
    order_code VARCHAR(50) UNIQUE NOT NULL,
    tx_hash VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS p2p_escrows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES p2p_orders(id),
    token_id UUID NOT NULL REFERENCES tokens(id),
    seller_id UUID NOT NULL,
    buyer_id UUID NOT NULL,
    amount DECIMAL(36, 18) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, RELEASED, REFUNDED, DISPUTED
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- 3. ACCOUNTING & LEDGER
-- ===============================================
CREATE TABLE IF NOT EXISTS balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token_id UUID REFERENCES tokens(id) ON DELETE CASCADE,
    available_balance NUMERIC(36, 18) DEFAULT 0,
    locked_balance NUMERIC(36, 18) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, token_id)
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token_id UUID REFERENCES tokens(id),
    type tx_type NOT NULL,
    status tx_status DEFAULT 'PENDING',
    amount NUMERIC(36, 18) NOT NULL,
    tx_hash VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ledger_entries (
    id BIGSERIAL PRIMARY KEY,
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    user_id UUID,
    token_id UUID REFERENCES tokens(id),
    entry_type ledger_entry_type NOT NULL,
    amount NUMERIC(36, 18) NOT NULL,
    balance_after NUMERIC(36, 18),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- 4. BACKGROUND JOBS
-- ===============================================
CREATE TABLE IF NOT EXISTS transaction_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id UUID,
    job_type VARCHAR(50) NOT NULL,
    status job_status DEFAULT 'QUEUED',
    retry_count INT DEFAULT 0,
    next_retry_at TIMESTAMPTZ DEFAULT NOW(),
    error_log TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- 5. ADMIN & AUDIT
-- ===============================================
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'manager',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admins(id),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    target_id UUID,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_config (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- 6. INDEXES
-- ===============================================
CREATE INDEX IF NOT EXISTS idx_balances_user_token ON balances(user_id, token_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_p2p_orders_code ON p2p_orders(order_code);
CREATE INDEX IF NOT EXISTS idx_p2p_ads_user ON p2p_ads(user_id);
