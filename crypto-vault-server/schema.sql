-- Setup Enums for Data Integrity
CREATE TYPE architecture_type AS ENUM ('EVM', 'UTXO', 'ACCOUNT', 'OTHER');
CREATE TYPE vm_type AS ENUM ('EVM', 'TVM', 'SVM', 'MOVE', 'NONE');
CREATE TYPE confirmation_model AS ENUM ('BLOCK', 'FINALITY', 'INSTANT');
CREATE TYPE p2p_order_status AS ENUM ('PENDING', 'PAID', 'COMPLETED', 'CANCELLED', 'DISPUTED');
CREATE TYPE escrow_type AS ENUM ('SMART_CONTRACT', 'ADDRESS', 'MULTISIG', 'NONE');
CREATE TYPE tx_job_status AS ENUM ('PENDING', 'BROADCASTED', 'CONFIRMED', 'FAILED');
CREATE TYPE tx_job_type AS ENUM ('TRANSFER', 'ESCROW_LOCK', 'ESCROW_RELEASE');

-- 1. Chains
CREATE TABLE chains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    chain_key VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'eth', 'btc', 'ton'
    architecture architecture_type NOT NULL,
    vm vm_type DEFAULT 'NONE',
    is_testnet BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}', -- Store block_time, explorer_url, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Chain Capabilities
CREATE TABLE chain_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chain_id UUID NOT NULL REFERENCES chains(id) ON DELETE CASCADE,
    supports_smart_contract BOOLEAN DEFAULT false,
    supports_token_standard BOOLEAN DEFAULT false,
    supports_nft BOOLEAN DEFAULT false,
    supports_multisig BOOLEAN DEFAULT false,
    supports_escrow BOOLEAN DEFAULT false,
    requires_memo BOOLEAN DEFAULT false,
    conf_model confirmation_model DEFAULT 'BLOCK',
    metadata JSONB DEFAULT '{}',
    UNIQUE(chain_id)
);

-- 3. RPC Endpoints
CREATE TABLE rpc_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chain_id UUID NOT NULL REFERENCES chains(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    priority INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Token Standards
CREATE TABLE token_standards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL, -- ERC20, BEP20, Jetton, SPL
    chain_id UUID NOT NULL REFERENCES chains(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    UNIQUE(chain_id, name)
);

-- 5. Tokens
CREATE TABLE tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chain_id UUID NOT NULL REFERENCES chains(id) ON DELETE CASCADE,
    standard_id UUID REFERENCES token_standards(id),
    symbol VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    decimals INTEGER NOT NULL DEFAULT 18,
    contract_address VARCHAR(255), -- NULL for native
    is_native BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}', -- Store coingecko_id, icon_url
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(chain_id, symbol, contract_address)
);

-- 6. Wallets (Account-level abstraction)
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- External user system
    chain_id UUID NOT NULL REFERENCES chains(id),
    address VARCHAR(255) NOT NULL,
    wallet_type architecture_type NOT NULL,
    derivation_path TEXT,
    name VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(chain_id, address)
);

-- 7. P2P Payment Methods
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- BANK, E-WALLET
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'
);

-- 8. P2P Ads
CREATE TABLE p2p_ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(10) CHECK (type IN ('BUY', 'SELL')),
    token_id UUID NOT NULL REFERENCES tokens(id),
    chain_id UUID NOT NULL REFERENCES chains(id),
    price DECIMAL(36, 18) NOT NULL,
    min_limit DECIMAL(36, 18) NOT NULL,
    max_limit DECIMAL(36, 18) NOT NULL,
    payment_method_id UUID REFERENCES payment_methods(id),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. P2P Orders
CREATE TABLE p2p_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID NOT NULL REFERENCES p2p_ads(id),
    token_id UUID NOT NULL REFERENCES tokens(id),
    chain_id UUID NOT NULL REFERENCES chains(id),
    seller_id UUID NOT NULL,
    buyer_id UUID NOT NULL,
    amount DECIMAL(36, 18) NOT NULL,
    price DECIMAL(36, 18) NOT NULL,
    status p2p_order_status DEFAULT 'PENDING',
    payment_proof_url TEXT,
    order_code VARCHAR(50) UNIQUE NOT NULL,
    tx_hash VARCHAR(255),
    escrow_strategy escrow_type DEFAULT 'NONE',
    metadata JSONB DEFAULT '{}', -- Store fiat_currency, memo_used
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- 10. Multi-chain Execution Model (Jobs Queue)
CREATE TABLE transaction_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chain_id UUID NOT NULL REFERENCES chains(id),
    type tx_job_type NOT NULL,
    payload JSONB NOT NULL, -- { from, to, amount, contract_args }
    status tx_job_status DEFAULT 'PENDING',
    tx_hash VARCHAR(255),
    retry_count INTEGER DEFAULT 0,
    error_log TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- 11. Chat System
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) CHECK (type IN ('P2P', 'AI')),
    order_id UUID REFERENCES p2p_orders(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    message_type VARCHAR(20) CHECK (message_type IN ('TEXT', 'IMAGE', 'ACTION')),
    content TEXT,
    image_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. NFT System
CREATE TABLE mint_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    chain_id UUID NOT NULL REFERENCES chains(id),
    contract_address VARCHAR(255),
    nft_name VARCHAR(100),
    image_ipfs_hash TEXT,
    metadata_ipfs_hash TEXT,
    tx_hash VARCHAR(255),
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Dynamic App Config
CREATE TABLE app_config (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Supported Tokens (Frontend Visibility)
CREATE TABLE supported_tokens (
    token_id UUID NOT NULL REFERENCES tokens(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    PRIMARY KEY (token_id)
);

-- 15. Disputes and Reviews
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES p2p_orders(id),
    disputer_id UUID NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'OPEN',
    resolution TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES p2p_orders(id),
    reviewer_id UUID NOT NULL,
    reviewee_id UUID NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. User Profiles (For Contacts and Identity)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    nickname VARCHAR(100),
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXING STRATEGY
CREATE INDEX idx_chains_active ON chains(is_active);
CREATE INDEX idx_tokens_chain_id ON tokens(chain_id);
CREATE INDEX idx_tokens_symbol ON tokens(symbol);
CREATE INDEX idx_tx_jobs_status ON transaction_jobs(status);
CREATE INDEX idx_p2p_ads_token ON p2p_ads(token_id, status);
CREATE INDEX idx_p2p_orders_status ON p2p_orders(status);
CREATE INDEX idx_messages_session ON messages(session_id, created_at);
CREATE INDEX idx_wallets_user ON wallets(user_id);
CREATE INDEX idx_chains_metadata ON chains USING GIN (metadata);
CREATE INDEX idx_tokens_metadata ON tokens USING GIN (metadata);
