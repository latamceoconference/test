"use client";

import * as React from "react";
import Link from "next/link";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatBRL } from "@/lib/money";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type OrderRow = {
  id: string;
  status: "pending_payment" | "paid" | "cancelled" | "failed" | "refunded";
  currency: string;
  subtotal: string | number;
  created_at: string;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  title: string;
  quantity: number;
  unit_price: string | number;
};

export default function AccountOrdersPage() {
  const { user } = useAuth();
  const add = useCartStore((s) => s.add);

  const [orders, setOrders] = React.useState<OrderRow[]>([]);
  const [itemsByOrder, setItemsByOrder] = React.useState<Record<string, OrderItemRow[]>>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setError(null);
    setNotice(null);
    if (!user) return;
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Supabase não configurado (.env.local).");
      return;
    }
    setLoading(true);

    const { data: ordersData, error: oErr } = await supabase
      .from("orders")
      .select("id,status,currency,subtotal,created_at")
      .order("created_at", { ascending: false });
    if (oErr) {
      setError(oErr.message);
      setLoading(false);
      return;
    }

    const o = (ordersData ?? []) as OrderRow[];
    setOrders(o);

    if (o.length === 0) {
      setItemsByOrder({});
      setLoading(false);
      return;
    }

    const ids = o.map((x) => x.id);
    const { data: itemsData, error: iErr } = await supabase
      .from("order_items")
      .select("id,order_id,product_id,variant_id,title,quantity,unit_price")
      .in("order_id", ids);
    if (iErr) {
      // If RLS for order_items isn't configured yet, show actionable hint.
      setError(iErr.message);
      setLoading(false);
      return;
    }

    const by: Record<string, OrderItemRow[]> = {};
    for (const it of (itemsData ?? []) as OrderItemRow[]) {
      by[it.order_id] = by[it.order_id] ?? [];
      by[it.order_id].push(it);
    }
    setItemsByOrder(by);
    setLoading(false);
  }, [user]);

  React.useEffect(() => {
    if (!user) return;
    load();
  }, [user, load]);

  const reorder = async (orderId: string) => {
    setError(null);
    setNotice(null);
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Supabase não configurado (.env.local).");
      return;
    }

    const items = itemsByOrder[orderId] ?? [];
    if (items.length === 0) {
      setNotice("Este pedido não tem itens para recomprar.");
      return;
    }

    // Load variants/products to rebuild cart lines with snapshot fields.
    const variantIds = items.map((i) => i.variant_id).filter((v) => v && v !== "unknown");
    const productIds = items.map((i) => i.product_id).filter((p) => p && p !== "unknown");

    const { data: variants } = await supabase
      .from("product_variants")
      .select("id,product_id,sku,sph,price,stock,is_active")
      .in("id", variantIds.length ? variantIds : ["__none__"]);

    const byVariant = new Map<string, any>();
    for (const v of variants ?? []) byVariant.set((v as any).id, v);

    const { data: products } = await supabase
      .from("products")
      .select("id,name,image_url,is_active")
      .in("id", productIds.length ? productIds : ["__none__"]);

    const byProduct = new Map<string, any>();
    for (const p of products ?? []) byProduct.set((p as any).id, p);

    let addedCount = 0;
    for (const it of items) {
      const v = byVariant.get(it.variant_id);
      const p = byProduct.get(it.product_id);
      if (!v || !p) continue;
      add({
        productId: p.id,
        variantId: v.id,
        sku: v.sku,
        title: p.name,
        image: p.image_url,
        sph: v.sph,
        unitPrice: typeof v.price === "string" ? Number(v.price) : v.price,
        quantity: it.quantity
      });
      addedCount++;
    }

    setNotice(addedCount > 0 ? `Itens adicionados ao carrinho: ${addedCount}.` : "Não foi possível recomprar este pedido.");
  };

  const ongoing = orders.filter((o) => o.status === "pending_payment");
  const history = orders.filter((o) => o.status !== "pending_payment");

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold text-black">Pedidos</h1>
          <p className="text-sm text-black/60">Veja seus pedidos, status e recompre em poucos cliques.</p>
        </CardHeader>
        <CardContent className="pt-0">
          {error ? (
            <div className="rounded-xl border border-red-500/20 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
              <div className="mt-2 text-xs text-red-700/80">
                Se isso aparecer após ativar pedidos por usuário, execute o SQL{" "}
                <span className="font-mono">supabase/orders_auth.sql</span> para configurar RLS.
              </div>
            </div>
          ) : null}

          {notice ? (
            <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {notice}
            </div>
          ) : null}

          {loading ? (
            <div className="mt-3 rounded-xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-black/60">
              Carregando pedidos...
            </div>
          ) : orders.length === 0 ? (
            <div className="mt-3 rounded-xl border border-black/10 bg-white/70 px-4 py-6 text-center text-sm text-black/60">
              Você ainda não tem pedidos.{" "}
              <Link href="/products" className="font-medium text-black hover:underline">
                Ver produtos
              </Link>
            </div>
          ) : (
            <div className="mt-3 space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-black">Em andamento</p>
                {ongoing.length === 0 ? (
                  <p className="text-sm text-black/60">Nenhum pedido em andamento.</p>
                ) : (
                  <div className="grid gap-3">
                    {ongoing.map((o) => (
                      <OrderCard key={o.id} order={o} items={itemsByOrder[o.id] ?? []} onReorder={reorder} />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-black">Histórico</p>
                <div className="grid gap-3">
                  {history.map((o) => (
                    <OrderCard key={o.id} order={o} items={itemsByOrder[o.id] ?? []} onReorder={reorder} />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-4">
            <Button variant="secondary" onClick={load} disabled={!user}>
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function statusLabel(status: OrderRow["status"]) {
  switch (status) {
    case "pending_payment":
      return "Aguardando pagamento";
    case "paid":
      return "Pago";
    case "cancelled":
      return "Cancelado";
    case "failed":
      return "Falhou";
    case "refunded":
      return "Reembolsado";
  }
}

function OrderCard({
  order,
  items,
  onReorder
}: {
  order: OrderRow;
  items: OrderItemRow[];
  onReorder: (orderId: string) => void;
}) {
  const total = typeof order.subtotal === "string" ? Number(order.subtotal) : order.subtotal;
  const created = new Date(order.created_at);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-black">
            Pedido <span className="font-mono text-xs text-black/70">{order.id.slice(0, 8)}</span>
          </p>
          <p className="text-sm text-black/60">
            {statusLabel(order.status)} • {created.toLocaleString("pt-BR")} • {itemCount} item(ns)
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-black/60">Total</p>
          <p className="text-lg font-semibold text-black">{formatBRL(total)}</p>
        </div>
      </div>

      {items.length ? (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-black/70">
          {items.slice(0, 3).map((it) => (
            <li key={it.id}>
              {it.title} • {it.quantity}x
            </li>
          ))}
          {items.length > 3 ? <li>…</li> : null}
        </ul>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Link
          href={`/account/orders/${order.id}`}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-black/10 bg-white/70 px-4 text-sm font-medium hover:bg-white"
        >
          Ver detalhes
        </Link>
        <button
          type="button"
          onClick={() => onReorder(order.id)}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-black px-4 text-sm font-medium text-white hover:opacity-90"
        >
          Recomprar
        </button>
      </div>
    </div>
  );
}


