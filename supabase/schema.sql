-- Marketplace MVP schema (non-destructive)
-- Run this on Supabase SQL editor.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id uuid primary key default gen_random_uuid(),
  wallet_address text unique not null,
  username text,
  avatar_url text,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS nfts (
  id uuid primary key default gen_random_uuid(),
  nft_address text unique,
  collection_address text,
  owner_address text,
  name text,
  description text,
  image_url text,
  metadata_url text,
  status text default 'pending',
  tx_hash text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

ALTER TABLE nfts ADD COLUMN IF NOT EXISTS attributes jsonb default '[]'::jsonb;

CREATE TABLE IF NOT EXISTS auctions (
  id uuid primary key default gen_random_uuid(),
  auction_contract_address text unique,
  nft_address text not null,
  seller_address text not null,
  current_bidder text,
  start_price numeric not null,
  current_price numeric default 0,
  min_bid_step numeric default 0,
  start_time timestamptz,
  end_time timestamptz not null,
  status text default 'pending',
  tx_hash text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS bids (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid references auctions(id),
  bidder_address text not null,
  amount numeric not null,
  tx_hash text unique,
  status text default 'pending',
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_address text,
  tx_hash text unique,
  type text,
  status text default 'pending',
  payload jsonb,
  created_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS idx_nfts_owner_address ON nfts(owner_address);
CREATE INDEX IF NOT EXISTS idx_auctions_status_end_time ON auctions(status, end_time desc);
CREATE INDEX IF NOT EXISTS idx_bids_auction_created ON bids(auction_id, created_at desc);
