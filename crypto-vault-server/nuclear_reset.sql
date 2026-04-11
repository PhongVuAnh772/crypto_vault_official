-- ===============================================
-- NUCLEAR RESET: CHUẨN HÓA TOÀN BỘ SANG UUID
-- ===============================================

-- Xóa các bảng cũ theo thứ tự phụ thuộc
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS app_config CASCADE;
DROP TABLE IF EXISTS supported_tokens CASCADE;
DROP TABLE IF EXISTS ledger_entries CASCADE;
DROP TABLE IF EXISTS balances CASCADE;
DROP TABLE IF EXISTS transaction_jobs CASCADE;
DROP TABLE IF EXISTS transaction_logs CASCADE;
DROP TABLE IF EXISTS deposits CASCADE;
DROP TABLE IF EXISTS withdrawals CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS rpc_endpoints CASCADE;
DROP TABLE IF EXISTS token_standards CASCADE;
DROP TABLE IF EXISTS tokens CASCADE;
DROP TABLE IF EXISTS chains CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- (Phần còn lại sẽ được khởi tạo lại bằng master_migration.js dùng file full_crypto_schema.sql mới)
