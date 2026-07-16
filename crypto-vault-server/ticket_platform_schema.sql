-- ============================================================
-- Digital Ticket Wallet Platform — Database Schema
-- Extends the existing CryptoVault schema
-- ============================================================

-- Enums
CREATE TYPE partner_type AS ENUM (
    'CINEMA', 'CONCERT', 'AIRLINE', 'HOTEL', 'STADIUM',
    'THEME_PARK', 'UNIVERSITY', 'GAMING', 'OTHER'
);

CREATE TYPE ticket_status AS ENUM (
    'ACTIVE', 'USED', 'CANCELLED', 'EXPIRED', 'TRANSFERRED', 'REFUNDED'
);

CREATE TYPE event_status AS ENUM (
    'DRAFT', 'ACTIVE', 'CANCELLED', 'COMPLETED'
);

CREATE TYPE scan_result_type AS ENUM (
    'VALID', 'INVALID', 'ALREADY_USED', 'EXPIRED', 'CANCELLED', 'NOT_FOUND'
);

CREATE TYPE webhook_status AS ENUM (
    'PENDING', 'DELIVERED', 'FAILED'
);

CREATE TYPE actor_type AS ENUM (
    'USER', 'PARTNER', 'STAFF', 'SYSTEM'
);

-- ============================================================
-- 1. Partners (Organizers / Third-party systems)
-- ============================================================
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type partner_type NOT NULL DEFAULT 'OTHER',
    description TEXT,
    logo_url TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    website_url TEXT,
    webhook_url TEXT,
    webhook_secret TEXT,                -- HMAC secret for signing webhooks
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. Partner API Keys
-- ============================================================
CREATE TABLE partner_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    key_name VARCHAR(100) DEFAULT 'default',
    api_key VARCHAR(64) UNIQUE NOT NULL,
    api_secret_hash TEXT NOT NULL,       -- SHA-256 hash of the secret
    scopes TEXT[] DEFAULT ARRAY[
        'ticket:issue', 'ticket:verify', 'ticket:cancel',
        'event:create', 'event:read', 'event:update'
    ],
    rate_limit INTEGER DEFAULT 100,     -- requests per minute
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,             -- NULL = never expires
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. Events
-- ============================================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    external_id VARCHAR(255),           -- Partner's own event ID
    name VARCHAR(500) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL,    -- MOVIE, CONCERT, FLIGHT, HOTEL_BOOKING, MATCH, etc.
    venue VARCHAR(500),
    venue_address TEXT,
    city VARCHAR(255),
    country VARCHAR(100),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    timezone VARCHAR(50) DEFAULT 'UTC',
    status event_status DEFAULT 'ACTIVE',
    max_capacity INTEGER,
    current_attendance INTEGER DEFAULT 0,
    poster_url TEXT,
    metadata JSONB DEFAULT '{}',        -- seat_map_url, terms, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(partner_id, external_id)
);

-- ============================================================
-- 4. Ticket Types (per event)
-- ============================================================
CREATE TABLE ticket_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,         -- VIP, Standard, Economy, etc.
    description TEXT,
    price DECIMAL(18, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    max_supply INTEGER,
    issued_count INTEGER DEFAULT 0,
    is_transferable BOOLEAN DEFAULT true,
    is_refundable BOOLEAN DEFAULT true,
    refund_deadline TIMESTAMPTZ,        -- After this, no refund
    metadata JSONB DEFAULT '{}',        -- seat_section, perks, color_code, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. Tickets
-- ============================================================
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_type_id UUID NOT NULL REFERENCES ticket_types(id),
    event_id UUID NOT NULL REFERENCES events(id),
    partner_id UUID NOT NULL REFERENCES partners(id),
    -- Ownership
    owner_wallet_address VARCHAR(255),
    owner_user_id UUID,
    -- Blockchain
    token_id INTEGER,                   -- On-chain NFT token ID
    contract_address VARCHAR(255),
    chain_id UUID REFERENCES chains(id),
    mint_tx_hash VARCHAR(255),
    metadata_uri TEXT,                  -- IPFS URI for NFT metadata
    -- Ticket Data
    external_ticket_id VARCHAR(255),    -- Partner's own ticket ID
    seat_info VARCHAR(255),
    gate VARCHAR(100),
    row_info VARCHAR(100),
    barcode VARCHAR(255),
    -- Status
    status ticket_status DEFAULT 'ACTIVE',
    -- QR Security
    qr_nonce VARCHAR(64),
    qr_nonce_expires_at TIMESTAMPTZ,
    -- Check-in
    used_at TIMESTAMPTZ,
    used_by_staff_id UUID,
    -- Transfer
    original_owner_address VARCHAR(255),
    transfer_count INTEGER DEFAULT 0,
    -- Timestamps
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(partner_id, external_ticket_id)
);

-- ============================================================
-- 6. Staff (Scanner app users)
-- ============================================================
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'scanner', -- scanner, manager, admin
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. Scan History
-- ============================================================
CREATE TABLE scan_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id),
    event_id UUID NOT NULL REFERENCES events(id),
    staff_id UUID NOT NULL REFERENCES staff(id),
    partner_id UUID NOT NULL REFERENCES partners(id),
    scan_result scan_result_type NOT NULL,
    scan_method VARCHAR(20) DEFAULT 'QR',   -- QR, NFC, MANUAL
    is_check_in BOOLEAN DEFAULT false,       -- true if this scan resulted in check-in
    device_info JSONB DEFAULT '{}',          -- device_model, os_version, app_version
    location JSONB DEFAULT '{}',             -- lat, lng, gate_name
    offline_scanned BOOLEAN DEFAULT false,   -- true if scanned offline
    synced_at TIMESTAMPTZ,                   -- when offline scan was synced
    scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. Webhook Logs
-- ============================================================
CREATE TABLE webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id),
    event_type VARCHAR(100) NOT NULL,   -- ticket.issued, ticket.used, event.cancelled, etc.
    url TEXT NOT NULL,
    method VARCHAR(10) DEFAULT 'POST',
    request_headers JSONB DEFAULT '{}',
    request_body JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    response_time_ms INTEGER,           -- Response time in milliseconds
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at TIMESTAMPTZ,
    status webhook_status DEFAULT 'PENDING',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ
);

-- ============================================================
-- 9. Audit Logs
-- ============================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_type actor_type NOT NULL,
    actor_id UUID,
    actor_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,       -- ticket.issue, ticket.verify, event.create, etc.
    resource_type VARCHAR(50),          -- ticket, event, partner, staff
    resource_id UUID,
    description TEXT,
    details JSONB DEFAULT '{}',         -- before/after state, additional context
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. Notifications
-- ============================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(500) NOT NULL,
    body TEXT,
    type VARCHAR(50) NOT NULL,          -- TICKET_ISSUED, TICKET_TRANSFERRED, EVENT_REMINDER, etc.
    priority VARCHAR(20) DEFAULT 'NORMAL', -- LOW, NORMAL, HIGH, URGENT
    reference_type VARCHAR(50),         -- ticket, event
    reference_id UUID,
    action_url TEXT,                    -- Deep link
    image_url TEXT,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 11. Ticket Transfers (Transfer history)
-- ============================================================
CREATE TABLE ticket_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id),
    from_address VARCHAR(255) NOT NULL,
    to_address VARCHAR(255) NOT NULL,
    from_user_id UUID,
    to_user_id UUID,
    tx_hash VARCHAR(255),
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, CONFIRMED, FAILED
    created_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Partners
CREATE INDEX idx_partners_type ON partners(type);
CREATE INDEX idx_partners_active ON partners(is_active);

-- API Keys
CREATE INDEX idx_partner_api_keys_key ON partner_api_keys(api_key);
CREATE INDEX idx_partner_api_keys_partner ON partner_api_keys(partner_id);

-- Events
CREATE INDEX idx_events_partner ON events(partner_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_start ON events(start_time);
CREATE INDEX idx_events_external ON events(partner_id, external_id);

-- Ticket Types
CREATE INDEX idx_ticket_types_event ON ticket_types(event_id);

-- Tickets
CREATE INDEX idx_tickets_owner ON tickets(owner_user_id);
CREATE INDEX idx_tickets_wallet ON tickets(owner_wallet_address);
CREATE INDEX idx_tickets_event ON tickets(event_id);
CREATE INDEX idx_tickets_partner ON tickets(partner_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_type ON tickets(ticket_type_id);
CREATE INDEX idx_tickets_token ON tickets(contract_address, token_id);
CREATE INDEX idx_tickets_external ON tickets(partner_id, external_ticket_id);
CREATE INDEX idx_tickets_nonce ON tickets(qr_nonce);

-- Staff
CREATE INDEX idx_staff_partner ON staff(partner_id);
CREATE INDEX idx_staff_email ON staff(email);

-- Scan History
CREATE INDEX idx_scan_history_ticket ON scan_history(ticket_id);
CREATE INDEX idx_scan_history_staff ON scan_history(staff_id);
CREATE INDEX idx_scan_history_event ON scan_history(event_id);
CREATE INDEX idx_scan_history_time ON scan_history(scanned_at);
CREATE INDEX idx_scan_history_partner ON scan_history(partner_id);

-- Webhook Logs
CREATE INDEX idx_webhook_logs_partner ON webhook_logs(partner_id);
CREATE INDEX idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX idx_webhook_logs_retry ON webhook_logs(status, next_retry_at)
    WHERE status = 'PENDING' AND next_retry_at IS NOT NULL;

-- Audit Logs
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_type, actor_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_time ON audit_logs(created_at);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_time ON notifications(created_at);

-- Ticket Transfers
CREATE INDEX idx_ticket_transfers_ticket ON ticket_transfers(ticket_id);
CREATE INDEX idx_ticket_transfers_from ON ticket_transfers(from_address);
CREATE INDEX idx_ticket_transfers_to ON ticket_transfers(to_address);
