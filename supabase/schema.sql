-- LensStore schema (Supabase / Postgres)
-- Execute in Supabase SQL editor.

-- Extensions
create extension if not exists pgcrypto;

-- PRODUCTS
create table if not exists public.products (
  id text primary key,
  name text not null,
  brand text not null,
  category text not null check (category in ('daily','monthly','toric','multifocal','color')),
  short_description text not null,
  description text not null,
  image_url text not null,
  pack_size integer not null,
  wear_period text not null check (wear_period in ('daily','monthly')),
  base_curve text,
  diameter text,
  water_content_percent integer,
  uv_blocking boolean,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_active_idx on public.products (is_active);

-- Variants (SPH)
create table if not exists public.product_variants (
  id text primary key,
  product_id text not null references public.products(id) on delete cascade,
  sku text not null,
  sph text not null,
  price numeric(10,2) not null,
  stock integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, sph)
);

create index if not exists product_variants_product_idx on public.product_variants (product_id);
create index if not exists product_variants_active_idx on public.product_variants (is_active);

-- ORDERS
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  status text not null check (status in ('pending_payment','paid','cancelled','failed','refunded')),
  currency text not null default 'BRL',
  subtotal numeric(10,2) not null,
  customer jsonb not null,
  mp_preference_id text,
  mp_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_status_idx on public.orders (status);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null,
  variant_id text not null,
  title text not null,
  quantity integer not null,
  unit_price numeric(10,2) not null
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- RLS
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Public catalog read
drop policy if exists "public read products" on public.products;
create policy "public read products"
on public.products for select
to anon, authenticated
using (is_active = true);

drop policy if exists "public read variants" on public.product_variants;
create policy "public read variants"
on public.product_variants for select
to anon, authenticated
using (is_active = true);

-- Orders should NOT be publicly readable.
-- Inserts/updates are done via service_role on the server.



