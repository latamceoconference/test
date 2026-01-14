"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, CreditCard, ReceiptText, X } from "lucide-react";

import type { Product, ProductVariant } from "@/lib/products";
import { formatBRL } from "@/lib/money";
import { VariantSelector } from "@/components/variant-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useCartStore } from "@/store/cart";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function ProductDetailBuyBox({ product }: { product: Product }) {
  const [liveVariants, setLiveVariants] = React.useState<ProductVariant[]>(product.variants);
  const [variant, setVariant] = React.useState<ProductVariant | null>(null);
  const [qty, setQty] = React.useState(1);
  const add = useCartStore((s) => s.add);
  const [addedOpen, setAddedOpen] = React.useState(false);
  const [addedSnapshot, setAddedSnapshot] = React.useState<{
    title: string;
    sph: string;
    quantity: number;
  } | null>(null);

  React.useEffect(() => {
    setLiveVariants(product.variants);
  }, [product.id, product.variants]);

  // Realtime: update stock/price when product_variants changes in Supabase
  React.useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`variants:${product.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "product_variants",
          filter: `product_id=eq.${product.id}`
        },
        (payload) => {
          const row = (payload.new ?? payload.old) as any;
          if (!row?.id) return;
          setLiveVariants((prev) => {
            const next = [...prev];
            const idx = next.findIndex((v) => v.id === row.id);
            const mapped: ProductVariant = {
              id: row.id,
              sku: row.sku,
              sph: row.sph,
              price: typeof row.price === "string" ? Number(row.price) : row.price,
              stock: row.stock
            };
            if (payload.eventType === "DELETE") {
              return next.filter((v) => v.id !== row.id);
            }
            if (idx === -1) return [...next, mapped].sort((a, b) => Number(a.sph) - Number(b.sph));
            next[idx] = mapped;
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [product.id]);

  const price = variant?.price ?? null;
  const canAdd = Boolean(variant) && (variant?.stock ?? 0) > 0;

  React.useEffect(() => {
    if (!addedOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAddedOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [addedOpen]);

  return (
    <>
      {addedOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Fechar"
            className="absolute inset-0 bg-black/30"
            onClick={() => setAddedOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-black/10 bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 text-white">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-black">Adicionado ao carrinho</p>
                  <p className="mt-1 text-sm text-black/60">
                    {addedSnapshot ? (
                      <>
                        <span className="font-medium text-black">{addedSnapshot.title}</span>{" "}
                        <span className="text-black/60">
                          (SPH {addedSnapshot.sph}) • {addedSnapshot.quantity}x
                        </span>
                      </>
                    ) : (
                      "Produto adicionado ao carrinho."
                    )}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-xl p-2 text-black/60 hover:bg-black/5 hover:text-black"
                onClick={() => setAddedOpen(false)}
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <Link
                href="/cart"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-black px-4 text-sm font-medium text-white hover:opacity-90"
              >
                Ir para o carrinho
              </Link>
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-black/10 bg-white/70 px-4 text-sm font-medium text-black hover:bg-white"
                onClick={() => setAddedOpen(false)}
              >
                Continuar comprando
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <Card className="sticky top-24 h-fit">
        <CardHeader>
          <p className="text-sm font-semibold text-black">Comprar</p>
          <p className="text-sm text-black/60">
            Selecione o grau (SPH) para habilitar “Adicionar ao carrinho”.
          </p>
        </CardHeader>
        <CardContent className="space-y-5 pt-0">
        <VariantSelector variants={liveVariants} value={variant} onChange={setVariant} />

        <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-black/60">Preço do grau selecionado</p>
            <p className="text-xl font-semibold text-black">{price == null ? "—" : formatBRL(price)}</p>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-black/60">Quantidade</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="h-9 w-9 rounded-xl border border-black/10 bg-white hover:bg-black/5"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span className="min-w-10 text-center text-sm font-medium text-black">{qty}</span>
              <button
                type="button"
                className="h-9 w-9 rounded-xl border border-black/10 bg-white hover:bg-black/5"
                onClick={() => setQty((q) => Math.min(10, q + 1))}
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          <Button
            size="lg"
            disabled={!canAdd}
            onClick={() => {
              if (!variant) return;
              add({
                productId: product.id,
                variantId: variant.id,
                sku: variant.sku,
                title: product.name,
                image: product.image,
                sph: variant.sph,
                unitPrice: variant.price,
                quantity: qty
              });
              setAddedSnapshot({ title: product.name, sph: variant.sph, quantity: qty });
              setAddedOpen(true);
            }}
          >
            {variant ? "Adicionar ao carrinho" : "Selecione o grau"}
          </Button>
          <Link href="/cart">
            <Button size="lg" variant="secondary" className="w-full">
              Ir para o carrinho
            </Button>
          </Link>
        </div>

        <div className="grid gap-2 rounded-2xl border border-black/10 bg-white/70 p-4 text-sm text-black/70">
          <div className="flex items-center gap-2">
            <ReceiptText className="h-4 w-4" />
            Pix
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Cartão
          </div>
        </div>
        </CardContent>
      </Card>
    </>
  );
}



