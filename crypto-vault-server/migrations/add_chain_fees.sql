-- Migration: Add per-chain transfer fee columns to chains table
-- These replace the hardcoded 0.001 values in publicRoutes.js

ALTER TABLE chains ADD COLUMN IF NOT EXISTS coin_transfer_fee NUMERIC(18,8) DEFAULT 0.001;
ALTER TABLE chains ADD COLUMN IF NOT EXISTS token_transfer_fee NUMERIC(18,8) DEFAULT 0.001;
ALTER TABLE chains ADD COLUMN IF NOT EXISTS nft_transfer_fee NUMERIC(18,8) DEFAULT 0.001;

-- Add comment for documentation
COMMENT ON COLUMN chains.coin_transfer_fee IS 'Admin fee percentage for native coin transfers (e.g., 0.001 = 0.1%)';
COMMENT ON COLUMN chains.token_transfer_fee IS 'Admin fee percentage for token transfers (e.g., 0.001 = 0.1%)';
COMMENT ON COLUMN chains.nft_transfer_fee IS 'Admin fee percentage for NFT transfers (e.g., 0.001 = 0.1%)';
