-- Functions for stock reservation & release (production basics)
-- Run in Supabase SQL editor AFTER schema.sql

create or replace function public.reserve_stock(p_order_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  r record;
  updated_count integer;
begin
  -- Deduct stock for each order item (all-or-nothing within this function)
  for r in
    select variant_id, quantity
    from public.order_items
    where order_id = p_order_id
  loop
    update public.product_variants
      set stock = stock - r.quantity,
          updated_at = now()
    where id = r.variant_id
      and is_active = true
      and stock >= r.quantity;

    get diagnostics updated_count = row_count;
    if updated_count = 0 then
      raise exception 'Insufficient stock for variant_id=%', r.variant_id;
    end if;
  end loop;
end;
$$;

create or replace function public.release_stock(p_order_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  r record;
begin
  for r in
    select variant_id, quantity
    from public.order_items
    where order_id = p_order_id
  loop
    update public.product_variants
      set stock = stock + r.quantity,
          updated_at = now()
    where id = r.variant_id;
  end loop;
end;
$$;


