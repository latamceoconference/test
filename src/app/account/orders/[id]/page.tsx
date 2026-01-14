"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

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

export default function AccountOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id ?? "";
  const { user } = useAuth();
  const add = useCartStore((s) => s.add);

  const [order, setOrder] = React.useState<OrderRow | null>(null);
  const [items, setItems] = React.useState<OrderItemRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!user || !orderId) return;
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Supabase não configurado (.env.local).");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setNotice(null);

    Promise.all([
      supabase.from("orders").select("id,status,currency,subtotal,created_at").eq("id", orderId).single(),
      supabase
        .from("order_items")
        .select("id,order_id,product_id,variant_id,title,quantity,unit_price")
        .eq("order_id", orderId)
    ]).then(([oRes, iRes]) => {
      if (oRes.error) {
        setError(oRes.error.message);
        setLoading(false);
        return;
      }
      setOrder(oRes.data as any);
      if (iRes.error) {
        setError(iRes.error.message);
        setLoading(false);
        return;
      }
      setItems((iRes.data ?? []) as any);
      setLoading(false);
    });
  }, [user, orderId]);

  const reorder = async () => {
    setError(null);
    setNotice(null);
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Supabase não configurado (.env.local).");
      return;
    }
    if (items.length === 0) {
      setNotice("Este pedido não tem itens para recomprar.");
      return;
    }

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

  const total = order ? (typeof order.subtotal === "string" ? Number(order.subtotal) : order.subtotal) : 0;
  const created = order ? new Date(order.created_at) : null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-black">Detalhes do pedido</h1>
              <p className="text-sm text-black/60">
                ID: <span className="font-mono">{orderId}</span>
              </p>
            </div>
            <Link href="/account/orders" className="text-sm font-medium text-black/70 hover:text-black">
              ← Voltar
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {error ? (
            <div className="rounded-xl border border-red-500/20 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}
          {notice ? (
            <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {notice}
            </div>
          ) : null}

          {loading ? (
            <div className="mt-3 rounded-xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-black/60">
              Carregando...
            </div>
          ) : order ? (
            <div className="mt-3 space-y-4">
              <div className="grid gap-2 rounded-2xl border border-black/10 bg-white/70 p-4 text-sm text-black/70">
                <div className="flex items-center justify-between">
                  <span className="text-black/60">Status</span>
                  <span className="font-medium text-black">{order.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-black/60">Criado em</span>
                  <span className="font-medium text-black">{created?.toLocaleString("pt-BR")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-black/60">Total</span>
                  <span className="text-base font-semibold text-black">{formatBRL(total)}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
                <p className="text-sm font-semibold text-black">Itens</p>
                {items.length === 0 ? (
                  <p className="mt-2 text-sm text-black/60">Nenhum item.</p>
                ) : (
                  <div className="mt-2 grid gap-2">
                    {items.map((it) => {
                      const unit = typeof it.unit_price === "string" ? Number(it.unit_price) : it.unit_price;
                      return (
                        <div key={it.id} className="flex items-start justify-between gap-3 rounded-xl border border-black/10 bg-white/70 p-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-black">{it.title}</p>
                            <p className="text-xs text-black/60">
                              {it.quantity}x • {formatBRL(unit)}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-black">{formatBRL(unit * it.quantity)}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={reorder}>Recomprar</Button>
                <Link href="/cart" className="inline-flex">
                  <Button variant="secondary" className="w-full">
                    Ver carrinho
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-3 rounded-xl border border-black/10 bg-white/70 px-4 py-6 text-center text-sm text-black/60">
              Pedido não encontrado.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


