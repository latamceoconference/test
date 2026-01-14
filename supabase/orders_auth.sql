-- Orders linked to authenticated users + RLS for "My Orders"
-- Run in Supabase SQL editor AFTER schema.sql and auth_profiles.sql.

-- 1) Add user_id to orders (nullable for guest checkout)
alter table public.orders
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists orders_user_id_idx on public.orders (user_id);

-- 2) RLS: authenticated users can read their own orders
drop policy if exists "orders read own" on public.orders;
create policy "orders read own"
on public.orders for select
to authenticated
using (user_id = auth.uid());

-- 3) RLS: authenticated users can read order_items of their own orders
drop policy if exists "order_items read own" on public.order_items;
create policy "order_items read own"
on public.order_items for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and o.user_id = auth.uid()
  )
);


