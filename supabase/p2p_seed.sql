-- Minimal seed for P2P MVP (run after p2p_mvp.sql)
-- Replace user UUIDs by real auth.users ids before running in non-local env.

insert into public.profiles(id, username, display_name)
values
  ('11111111-1111-1111-1111-111111111111', 'seller_demo', 'Seller Demo'),
  ('22222222-2222-2222-2222-222222222222', 'buyer_demo', 'Buyer Demo')
on conflict (id) do nothing;

insert into public.wallets(id, user_id, wallet_code, is_main)
values
  ('11111111-aaaa-1111-aaaa-111111111111', '11111111-1111-1111-1111-111111111111', 'MAIN-SELLER', true),
  ('22222222-bbbb-2222-bbbb-222222222222', '22222222-2222-2222-2222-222222222222', 'MAIN-BUYER', true)
on conflict (id) do nothing;

insert into public.wallet_assets(id, wallet_id, asset_code, network_code, available_balance, frozen_balance)
values
  ('33333333-aaaa-3333-aaaa-333333333333', '11111111-aaaa-1111-aaaa-111111111111', 'USDT', 'TON', 1000, 0),
  ('44444444-bbbb-4444-bbbb-444444444444', '22222222-bbbb-2222-bbbb-222222222222', 'USDT', 'TON', 20, 0)
on conflict (wallet_id, asset_code, network_code) do nothing;

insert into public.payment_methods(id, user_id, method_type, bank_name, bank_account_name, bank_account_number, is_active)
values
  ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'BANK_TRANSFER', 'Vietcombank', 'SELLER DEMO', '0123456789', true)
on conflict (id) do nothing;

insert into public.p2p_ads(
  id, seller_id, wallet_asset_id, payment_method_id, side, asset_code, network_code, fiat_code,
  price, min_fiat_amount, max_fiat_amount, total_asset_amount, remaining_asset_amount, status
)
values
  (
    '66666666-6666-6666-6666-666666666666',
    '11111111-1111-1111-1111-111111111111',
    '33333333-aaaa-3333-aaaa-333333333333',
    '55555555-5555-5555-5555-555555555555',
    'SELL', 'USDT', 'TON', 'VND',
    26000, 100000, 10000000, 400, 400, 'ACTIVE'
  )
on conflict (id) do nothing;
