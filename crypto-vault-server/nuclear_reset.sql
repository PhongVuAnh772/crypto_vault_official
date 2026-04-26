-- ===============================================
-- NUCLEAR RESET: LÀM SẠCH TOÀN BỘ DATABASE
-- ===============================================

-- Tắt kiểm tra ràng buộc tạm thời (nếu cần)
SET session_replication_role = 'replica';

-- Xóa các bảng theo thứ tự từ bảng phụ thuộc đến bảng gốc
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS disputes CASCADE;
DROP TABLE IF EXISTS p2p_escrows CASCADE;
DROP TABLE IF EXISTS p2p_orders CASCADE;
DROP TABLE IF EXISTS p2p_ads CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS social_posts CASCADE;
DROP TABLE IF EXISTS mint_records CASCADE;
DROP TABLE IF EXISTS ledger_entries CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS balances CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS rpc_endpoints CASCADE;
DROP TABLE IF EXISTS supported_tokens CASCADE;
DROP TABLE IF EXISTS tokens CASCADE;
DROP TABLE IF EXISTS chain_capabilities CASCADE;
DROP TABLE IF EXISTS chains CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS app_config CASCADE;
DROP TABLE IF EXISTS transaction_jobs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Bật lại kiểm tra ràng buộc
SET session_replication_role = 'origin';

-- Reset lại các ENUM types nếu muốn (Optional)
-- DROP TYPE IF EXISTS tx_status CASCADE;
-- DROP TYPE IF EXISTS tx_type CASCADE;
-- DROP TYPE IF EXISTS ledger_entry_type CASCADE;
-- DROP TYPE IF EXISTS job_status CASCADE;
-- DROP TYPE IF EXISTS p2p_order_status CASCADE;
-- DROP TYPE IF EXISTS architecture_type CASCADE;
-- DROP TYPE IF EXISTS vm_type CASCADE;
-- DROP TYPE IF EXISTS confirmation_model CASCADE;

-- (Database đã sạch. Chạy ultimate_schema.sql để khởi tạo lại)
