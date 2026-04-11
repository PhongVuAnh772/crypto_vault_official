-- ===============================================
-- KHỞI TẠO KIỂU DỮ LIỆU (ENUMS)
-- ===============================================
DO $$ BEGIN
    CREATE TYPE tx_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');
    CREATE TYPE tx_type AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'TRADE', 'FEE', 'P2P_ESCROW', 'P2P_RELEASE');
    CREATE TYPE ledger_entry_type AS ENUM ('CREDIT', 'DEBIT');
    CREATE TYPE job_status AS ENUM ('QUEUED', 'RUNNING', 'SUCCESS', 'FAILED', 'RETRYING');
    CREATE TYPE p2p_status AS ENUM ('OPEN', 'ESCROWED', 'COMPLETED', 'DISPUTED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ===============================================
-- 1. BẢNG CƠ SỞ (CORE)
-- ===============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ext_user_id VARCHAR(255) UNIQUE NOT NULL, -- Dùng map với Auth0/Firebase hoặc Supabase Auth
    kyc_level INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- (Bảng chains và tokens nên map với code đã có của bạn nếu chúng tồn tại, ví dụ: 
--  chỉ cần ALTER TABLE thêm các trường nếu thiếu. Ở đây tôi xây dựng mới chuẩn)
CREATE TABLE IF NOT EXISTS chains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chain_name VARCHAR(50) UNIQUE NOT NULL,
    native_symbol VARCHAR(10) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chain_id UUID REFERENCES chains(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    contract_address VARCHAR(255),
    decimals INT DEFAULT 18,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(chain_id, contract_address)
);

CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    chain_id UUID REFERENCES chains(id),
    address VARCHAR(255) NOT NULL,
    is_custodial BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(chain_id, address)
);

-- ===============================================
-- 2. HỆ THỐNG KẾ TOÁN (LEDGER & BALANCES)
-- ===============================================
CREATE TABLE IF NOT EXISTS balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_id UUID REFERENCES tokens(id) ON DELETE CASCADE,
    available_balance NUMERIC(36, 18) DEFAULT 0 CHECK (available_balance >= 0),
    locked_balance NUMERIC(36, 18) DEFAULT 0 CHECK (locked_balance >= 0),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, token_id)
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_id UUID REFERENCES tokens(id),
    type tx_type NOT NULL,
    status tx_status DEFAULT 'PENDING',
    amount NUMERIC(36, 18) NOT NULL,
    reference_id UUID, -- Liên kết mềm tới table withdrawals, deposits
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng sổ cái kép chân lý tuyệt đối
CREATE TABLE IF NOT EXISTS ledger_entries (
    id BIGSERIAL PRIMARY KEY,
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    token_id UUID REFERENCES tokens(id),
    entry_type ledger_entry_type NOT NULL,
    amount NUMERIC(36, 18) NOT NULL CHECK (amount > 0),
    balance_after NUMERIC(36, 18), -- Vết lưu giá trị sau cập nhật để audit
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- 3. GIAO DỊCH ON-CHAIN (CHAIN OPS)
-- ===============================================
CREATE TABLE IF NOT EXISTS deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id),
    tx_hash VARCHAR(255) UNIQUE NOT NULL, -- Tính Unique phòng chống quét trùng
    wallet_id UUID REFERENCES wallets(id),
    confirmations INT DEFAULT 0,
    status tx_status DEFAULT 'PENDING'
);

CREATE TABLE IF NOT EXISTS withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id),
    wallet_id UUID REFERENCES wallets(id),
    to_address VARCHAR(255) NOT NULL,
    tx_hash VARCHAR(255) UNIQUE,
    fee_amount NUMERIC(36, 18) DEFAULT 0,
    status tx_status DEFAULT 'PENDING'
);

-- ===============================================
-- 4. HỆ THỐNG CÔNG NHÂN XỬ LÝ (WORKER JOBS)
-- ===============================================
CREATE TABLE IF NOT EXISTS transaction_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id UUID NOT NULL, -- Link ID của transactions / withdrawals
    job_type VARCHAR(50) NOT NULL, -- e.g., 'BROADCAST_WITHDRAWAL'
    status job_status DEFAULT 'QUEUED',
    retry_count INT DEFAULT 0,
    next_retry_at TIMESTAMPTZ DEFAULT NOW(),
    error_log TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- 5. CHIẾN LƯỢC ĐÁNH INDEX (INDEXING STRATEGY)
-- ===============================================
CREATE INDEX IF NOT EXISTS idx_balances_user_token ON balances(user_id, token_id);
CREATE INDEX IF NOT EXISTS idx_ledger_tx ON ledger_entries(transaction_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status_date ON transaction_jobs(status, next_retry_at) 
    WHERE status IN ('QUEUED', 'RETRYING');
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
