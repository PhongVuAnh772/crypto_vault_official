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
    CREATE TYPE confirmation_model AS ENUM ('BLOCK', 'TIME', 'FINALITY');
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
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nickname VARCHAR(100),
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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
    admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
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
-- 2. BLOCKCHAIN & TOKENS
-- ===============================================
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

CREATE TABLE IF NOT EXISTS chain_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chain_id UUID NOT NULL UNIQUE REFERENCES chains(id) ON DELETE CASCADE,
    supports_smart_contract BOOLEAN DEFAULT false,
    supports_token_standard BOOLEAN DEFAULT false,
    supports_nft BOOLEAN DEFAULT false,
    supports_multisig BOOLEAN DEFAULT false,
    supports_escrow BOOLEAN DEFAULT false,
    requires_memo BOOLEAN DEFAULT false,
    conf_model confirmation_model DEFAULT 'BLOCK',
    metadata JSONB DEFAULT '{}'
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
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chain_id UUID REFERENCES chains(id) ON DELETE CASCADE,
    address VARCHAR(255) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(chain_id, address)
);

-- ===============================================
-- 3. ACCOUNTING & TRANSACTIONS
-- ===============================================
CREATE TABLE IF NOT EXISTS balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_id UUID REFERENCES tokens(id) ON DELETE CASCADE,
    available_balance NUMERIC(36, 18) DEFAULT 0,
    locked_balance NUMERIC(36, 18) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, token_id)
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_id UUID REFERENCES tokens(id),
    entry_type ledger_entry_type NOT NULL,
    amount NUMERIC(36, 18) NOT NULL,
    balance_after NUMERIC(36, 18),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- 4. P2P MARKETPLACE
-- ===============================================
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS p2p_ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
    seller_id UUID NOT NULL REFERENCES users(id),
    buyer_id UUID NOT NULL REFERENCES users(id),
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
    order_id UUID NOT NULL REFERENCES p2p_orders(id) ON DELETE CASCADE,
    token_id UUID NOT NULL REFERENCES tokens(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    buyer_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(36, 18) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES p2p_orders(id) ON DELETE CASCADE,
    disputer_id UUID NOT NULL REFERENCES users(id),
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'OPEN',
    resolution TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES p2p_orders(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id),
    reviewee_id UUID NOT NULL REFERENCES users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- 5. CHAT & SOCIAL
-- ===============================================
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(10) CHECK (type IN ('P2P', 'AI')),
    order_id UUID REFERENCES p2p_orders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    message_type VARCHAR(10) CHECK (message_type IN ('TEXT', 'IMAGE', 'ACTION')),
    content TEXT,
    image_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) REFERENCES users(ext_user_id) ON DELETE CASCADE,
    user_name VARCHAR(100) DEFAULT 'Anonymous',
    user_avatar TEXT DEFAULT 'https://via.placeholder.com/40',
    type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    images JSONB DEFAULT '[]',
    trade_data JSONB,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- 6. OTHERS
-- ===============================================
CREATE TABLE IF NOT EXISTS mint_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chain_id VARCHAR(50) NOT NULL,
    contract_address VARCHAR(255),
    nft_name VARCHAR(100),
    image_ipfs_hash TEXT,
    metadata_ipfs_hash TEXT,
    tx_hash VARCHAR(255),
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transaction_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id UUID,
    job_type VARCHAR(50) NOT NULL,
    status job_status DEFAULT 'QUEUED',
    error_log TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    next_retry_at TIMESTAMPTZ DEFAULT NOW(),
    retry_count INTEGER DEFAULT 0
);

-- ===============================================
-- 7. INDEXING STRATEGY
-- ===============================================
CREATE INDEX IF NOT EXISTS idx_balances_user_token ON balances(user_id, token_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_p2p_orders_code ON p2p_orders(order_code);
CREATE INDEX IF NOT EXISTS idx_p2p_ads_user ON p2p_ads(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_user ON social_posts(user_id);
