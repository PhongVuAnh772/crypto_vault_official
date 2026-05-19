-- P2P MVP schema for Supabase/Postgres
-- Run in Supabase SQL editor as service role/admin.

create extension if not exists pgcrypto;

-- =========================
-- Enums
-- =========================
do $$ begin
  create type p2p_ad_side as enum ('BUY', 'SELL');
exception when duplicate_object then null; end $$;

do $$ begin
  create type p2p_ad_status as enum ('ACTIVE', 'PAUSED', 'ARCHIVED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type p2p_order_status as enum ('PENDING_PAYMENT', 'PAID', 'RELEASED', 'CANCELLED', 'EXPIRED', 'DISPUTED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type p2p_dispute_status as enum ('OPEN', 'UNDER_REVIEW', 'RESOLVED_BUYER', 'RESOLVED_SELLER', 'REJECTED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type ledger_entry_type as enum ('CREDIT', 'DEBIT', 'FREEZE', 'UNFREEZE', 'RELEASE');
exception when duplicate_object then null; end $$;

do $$ begin
  create type proof_status as enum ('PENDING', 'VERIFIED', 'REJECTED');
exception when duplicate_object then null; end $$;

-- =========================
-- Profiles + Wallet
-- =========================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  kyc_level int default 0,
  is_banned boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  wallet_code text not null unique,
  is_main boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists idx_wallets_user_id on public.wallets(user_id);

create table if not exists public.wallet_assets (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.wallets(id),
  asset_code text not null,           -- USDT
  network_code text not null,         -- TON/TRON/ERC20 future-ready
  available_balance numeric(36,18) not null default 0,
  frozen_balance numeric(36,18) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(wallet_id, asset_code, network_code)
);
create index if not exists idx_wallet_assets_wallet on public.wallet_assets(wallet_id);
create index if not exists idx_wallet_assets_asset on public.wallet_assets(asset_code, network_code);

-- =========================
-- Ledger (source of truth)
-- =========================
create table if not exists public.ledger_transactions (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text unique not null,
  reference_type text not null,       -- AD_CREATE / ORDER_CREATE / ORDER_RELEASE / ORDER_EXPIRE / DISPUTE_RESOLVE
  reference_id uuid,
  from_wallet_asset_id uuid references public.wallet_assets(id),
  to_wallet_asset_id uuid references public.wallet_assets(id),
  entry_type ledger_entry_type not null,
  amount numeric(36,18) not null check (amount > 0),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create index if not exists idx_ledger_ref on public.ledger_transactions(reference_type, reference_id);
create index if not exists idx_ledger_from on public.ledger_transactions(from_wallet_asset_id);
create index if not exists idx_ledger_to on public.ledger_transactions(to_wallet_asset_id);

-- =========================
-- Payment + Ads + Orders
-- =========================
create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  method_type text not null,          -- BANK_TRANSFER
  bank_name text,
  bank_account_name text,
  bank_account_number text,
  qr_payload text,
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists idx_payment_methods_user on public.payment_methods(user_id, is_active);

create table if not exists public.p2p_ads (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id),
  wallet_asset_id uuid not null references public.wallet_assets(id),
  payment_method_id uuid references public.payment_methods(id),
  side p2p_ad_side not null,          -- for MVP mostly SELL
  asset_code text not null,
  network_code text not null,
  fiat_code text not null,            -- VND
  price numeric(36,18) not null check (price > 0),
  min_fiat_amount numeric(36,18) not null check (min_fiat_amount > 0),
  max_fiat_amount numeric(36,18) not null check (max_fiat_amount > 0),
  total_asset_amount numeric(36,18) not null check (total_asset_amount > 0),
  remaining_asset_amount numeric(36,18) not null check (remaining_asset_amount >= 0),
  status p2p_ad_status not null default 'ACTIVE',
  payment_window_minutes int not null default 15,
  terms text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists idx_p2p_ads_market on public.p2p_ads(status, asset_code, fiat_code, price);
create index if not exists idx_p2p_ads_seller on public.p2p_ads(seller_id, status);

create table if not exists public.p2p_orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null unique,
  ad_id uuid not null references public.p2p_ads(id),
  buyer_id uuid not null references public.profiles(id),
  seller_id uuid not null references public.profiles(id),
  escrow_wallet_asset_id uuid not null references public.wallet_assets(id),
  buyer_wallet_asset_id uuid references public.wallet_assets(id),
  asset_code text not null,
  network_code text not null,
  fiat_code text not null,
  unit_price numeric(36,18) not null,
  asset_amount numeric(36,18) not null check (asset_amount > 0),
  fiat_amount numeric(36,18) not null check (fiat_amount > 0),
  status p2p_order_status not null default 'PENDING_PAYMENT',
  expires_at timestamptz not null,
  paid_at timestamptz,
  released_at timestamptz,
  cancelled_at timestamptz,
  release_idempotency_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists idx_p2p_orders_buyer on public.p2p_orders(buyer_id, status, created_at desc);
create index if not exists idx_p2p_orders_seller on public.p2p_orders(seller_id, status, created_at desc);
create index if not exists idx_p2p_orders_expiry on public.p2p_orders(status, expires_at);

create table if not exists public.payment_proofs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.p2p_orders(id),
  uploaded_by uuid not null references public.profiles(id),
  file_path text not null,
  file_url text not null,
  status proof_status not null default 'PENDING',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_payment_proofs_order on public.payment_proofs(order_id, created_at desc);

-- =========================
-- Chat + Dispute
-- =========================
create table if not exists public.order_chats (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.p2p_orders(id),
  sender_id uuid not null references public.profiles(id),
  message text not null,
  message_type text not null default 'TEXT',
  attachment_url text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists idx_order_chats_order on public.order_chats(order_id, created_at desc);

create table if not exists public.disputes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.p2p_orders(id),
  opened_by uuid not null references public.profiles(id),
  reason text not null,
  status p2p_dispute_status not null default 'OPEN',
  resolution text,
  resolved_by uuid references public.profiles(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dispute_messages (
  id uuid primary key default gen_random_uuid(),
  dispute_id uuid not null references public.disputes(id),
  sender_id uuid not null references public.profiles(id),
  message text not null,
  attachment_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  is_read boolean default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_notifications_user on public.notifications(user_id, is_read, created_at desc);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  actor_role text not null default 'USER',
  action text not null,
  resource_type text not null,
  resource_id uuid,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id),
  action text not null,
  target_type text not null,
  target_id uuid,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- =========================
-- RLS
-- =========================
alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.wallet_assets enable row level security;
alter table public.ledger_transactions enable row level security;
alter table public.payment_methods enable row level security;
alter table public.p2p_ads enable row level security;
alter table public.p2p_orders enable row level security;
alter table public.payment_proofs enable row level security;
alter table public.order_chats enable row level security;
alter table public.disputes enable row level security;
alter table public.dispute_messages enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.admin_actions enable row level security;

drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles
for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists wallets_self on public.wallets;
create policy wallets_self on public.wallets
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists wallet_assets_self on public.wallet_assets;
create policy wallet_assets_self on public.wallet_assets
for select using (
  exists(select 1 from public.wallets w where w.id = wallet_id and w.user_id = auth.uid())
);

drop policy if exists payment_methods_self on public.payment_methods;
create policy payment_methods_self on public.payment_methods
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists ads_public_read on public.p2p_ads;
create policy ads_public_read on public.p2p_ads
for select using (status = 'ACTIVE');

drop policy if exists ads_owner_write on public.p2p_ads;
create policy ads_owner_write on public.p2p_ads
for all using (auth.uid() = seller_id) with check (auth.uid() = seller_id);

drop policy if exists orders_party_read on public.p2p_orders;
create policy orders_party_read on public.p2p_orders
for select using (auth.uid() = buyer_id or auth.uid() = seller_id);

drop policy if exists orders_party_write on public.p2p_orders;
create policy orders_party_write on public.p2p_orders
for update using (auth.uid() = buyer_id or auth.uid() = seller_id);

drop policy if exists order_chats_party on public.order_chats;
create policy order_chats_party on public.order_chats
for all using (
  exists(
    select 1 from public.p2p_orders o
    where o.id = order_id and (o.buyer_id = auth.uid() or o.seller_id = auth.uid())
  )
) with check (
  exists(
    select 1 from public.p2p_orders o
    where o.id = order_id and (o.buyer_id = auth.uid() or o.seller_id = auth.uid())
  )
);

drop policy if exists proofs_party on public.payment_proofs;
create policy proofs_party on public.payment_proofs
for all using (
  exists(select 1 from public.p2p_orders o where o.id = order_id and (o.buyer_id = auth.uid() or o.seller_id = auth.uid()))
) with check (
  exists(select 1 from public.p2p_orders o where o.id = order_id and (o.buyer_id = auth.uid() or o.seller_id = auth.uid()))
);

drop policy if exists notifications_self on public.notifications;
create policy notifications_self on public.notifications
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- service role bypasses RLS for sensitive ops

-- =========================
-- Atomic ledger RPC
-- =========================
create or replace function public.rpc_wallet_move(
  p_from_wallet_asset_id uuid,
  p_to_wallet_asset_id uuid,
  p_amount numeric,
  p_mode text, -- FREEZE | UNFREEZE | RELEASE | TRANSFER
  p_reference_type text,
  p_reference_id uuid,
  p_idempotency_key text,
  p_actor_id uuid,
  p_metadata jsonb default '{}'::jsonb
) returns uuid
language plpgsql
security definer
as $$
declare
  v_tx_id uuid;
begin
  if p_amount <= 0 then
    raise exception 'Amount must be > 0';
  end if;

  if exists(select 1 from public.ledger_transactions where idempotency_key = p_idempotency_key) then
    return (select id from public.ledger_transactions where idempotency_key = p_idempotency_key limit 1);
  end if;

  -- lock rows for race safety
  perform 1 from public.wallet_assets where id = p_from_wallet_asset_id for update;
  perform 1 from public.wallet_assets where id = p_to_wallet_asset_id for update;

  if p_mode = 'FREEZE' then
    update public.wallet_assets
    set available_balance = available_balance - p_amount,
        frozen_balance = frozen_balance + p_amount,
        updated_at = now()
    where id = p_from_wallet_asset_id and available_balance >= p_amount;
    if not found then raise exception 'Insufficient available balance'; end if;
  elsif p_mode = 'UNFREEZE' then
    update public.wallet_assets
    set frozen_balance = frozen_balance - p_amount,
        available_balance = available_balance + p_amount,
        updated_at = now()
    where id = p_from_wallet_asset_id and frozen_balance >= p_amount;
    if not found then raise exception 'Insufficient frozen balance'; end if;
  elsif p_mode = 'RELEASE' then
    update public.wallet_assets
    set frozen_balance = frozen_balance - p_amount,
        updated_at = now()
    where id = p_from_wallet_asset_id and frozen_balance >= p_amount;
    if not found then raise exception 'Insufficient escrow frozen balance'; end if;

    update public.wallet_assets
    set available_balance = available_balance + p_amount,
        updated_at = now()
    where id = p_to_wallet_asset_id;
  else
    update public.wallet_assets
    set available_balance = available_balance - p_amount, updated_at = now()
    where id = p_from_wallet_asset_id and available_balance >= p_amount;
    if not found then raise exception 'Insufficient available balance'; end if;
    update public.wallet_assets
    set available_balance = available_balance + p_amount, updated_at = now()
    where id = p_to_wallet_asset_id;
  end if;

  insert into public.ledger_transactions(
    idempotency_key, reference_type, reference_id, from_wallet_asset_id, to_wallet_asset_id,
    entry_type, amount, metadata, created_by
  ) values (
    p_idempotency_key, p_reference_type, p_reference_id, p_from_wallet_asset_id, p_to_wallet_asset_id,
    case
      when p_mode = 'FREEZE' then 'FREEZE'::ledger_entry_type
      when p_mode = 'UNFREEZE' then 'UNFREEZE'::ledger_entry_type
      when p_mode = 'RELEASE' then 'RELEASE'::ledger_entry_type
      else 'DEBIT'::ledger_entry_type
    end,
    p_amount, p_metadata, p_actor_id
  ) returning id into v_tx_id;

  return v_tx_id;
end;
$$;

create or replace function public.rpc_create_p2p_order(
  p_ad_id uuid,
  p_buyer_id uuid,
  p_asset_amount numeric,
  p_order_no text,
  p_expires_at timestamptz
) returns uuid
language plpgsql
security definer
as $$
declare
  v_ad public.p2p_ads%rowtype;
  v_order_id uuid;
  v_fiat_amount numeric;
begin
  if p_asset_amount <= 0 then
    raise exception 'asset_amount must be > 0';
  end if;

  select * into v_ad from public.p2p_ads where id = p_ad_id for update;
  if not found then
    raise exception 'ad not found';
  end if;

  if v_ad.status <> 'ACTIVE' then
    raise exception 'ad not active';
  end if;

  if v_ad.remaining_asset_amount < p_asset_amount then
    raise exception 'insufficient ad liquidity';
  end if;

  v_fiat_amount := v_ad.price * p_asset_amount;

  update public.p2p_ads
  set remaining_asset_amount = remaining_asset_amount - p_asset_amount,
      updated_at = now()
  where id = v_ad.id;

  insert into public.p2p_orders(
    order_no, ad_id, buyer_id, seller_id, escrow_wallet_asset_id,
    asset_code, network_code, fiat_code, unit_price, asset_amount, fiat_amount,
    status, expires_at
  ) values (
    p_order_no, v_ad.id, p_buyer_id, v_ad.seller_id, v_ad.wallet_asset_id,
    v_ad.asset_code, v_ad.network_code, v_ad.fiat_code, v_ad.price, p_asset_amount, v_fiat_amount,
    'PENDING_PAYMENT', p_expires_at
  ) returning id into v_order_id;

  perform public.rpc_wallet_move(
    v_ad.wallet_asset_id,
    v_ad.wallet_asset_id,
    p_asset_amount,
    'FREEZE',
    'ORDER_CREATE',
    v_order_id,
    'freeze-' || v_order_id::text,
    v_ad.seller_id,
    jsonb_build_object('ad_id', v_ad.id)
  );

  return v_order_id;
end;
$$;

create or replace function public.rpc_release_p2p_order(
  p_order_id uuid,
  p_actor_id uuid,
  p_idempotency_key text
) returns uuid
language plpgsql
security definer
as $$
declare
  v_order public.p2p_orders%rowtype;
  v_buyer_wallet_asset_id uuid;
begin
  select * into v_order from public.p2p_orders where id = p_order_id for update;
  if not found then
    raise exception 'order not found';
  end if;

  if v_order.status <> 'PAID' then
    raise exception 'order must be PAID';
  end if;

  if v_order.seller_id <> p_actor_id then
    raise exception 'forbidden';
  end if;

  if v_order.release_idempotency_key is not null then
    return v_order.id;
  end if;

  select wa.id into v_buyer_wallet_asset_id
  from public.wallet_assets wa
  join public.wallets w on w.id = wa.wallet_id
  where w.user_id = v_order.buyer_id
    and wa.asset_code = v_order.asset_code
    and wa.network_code = v_order.network_code
  limit 1;

  if v_buyer_wallet_asset_id is null then
    raise exception 'buyer wallet asset not found';
  end if;

  perform public.rpc_wallet_move(
    v_order.escrow_wallet_asset_id,
    v_buyer_wallet_asset_id,
    v_order.asset_amount,
    'RELEASE',
    'ORDER_RELEASE',
    v_order.id,
    p_idempotency_key,
    p_actor_id,
    jsonb_build_object('order_no', v_order.order_no)
  );

  update public.p2p_orders
  set status = 'RELEASED',
      released_at = now(),
      release_idempotency_key = p_idempotency_key,
      updated_at = now()
  where id = v_order.id;

  return v_order.id;
end;
$$;

create or replace function public.rpc_expire_p2p_orders(
  p_limit int default 100
) returns int
language plpgsql
security definer
as $$
declare
  v_order record;
  v_count int := 0;
begin
  for v_order in
    select id, seller_id, escrow_wallet_asset_id, asset_amount
    from public.p2p_orders
    where status = 'PENDING_PAYMENT'
      and expires_at <= now()
    order by expires_at asc
    limit p_limit
    for update skip locked
  loop
    perform public.rpc_wallet_move(
      v_order.escrow_wallet_asset_id,
      v_order.escrow_wallet_asset_id,
      v_order.asset_amount,
      'UNFREEZE',
      'ORDER_EXPIRE',
      v_order.id,
      'expire-' || v_order.id::text,
      v_order.seller_id,
      '{}'::jsonb
    );

    update public.p2p_orders
    set status = 'EXPIRED',
        cancelled_at = now(),
        updated_at = now()
    where id = v_order.id;

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

-- =========================
-- Seed data
-- =========================
insert into public.audit_logs(actor_role, action, resource_type, payload)
values ('SYSTEM', 'P2P_SCHEMA_READY', 'SYSTEM', '{"version":"mvp-v1"}')
on conflict do nothing;
