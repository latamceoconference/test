"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2 } from "lucide-react";

import { useCartStore } from "@/store/cart";
import { formatBRL } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function CartPage() {
  const lines = useCartStore((s) => s.lines);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);

  const subtotal = lines.reduce((sum, l) => {
    return sum + l.unitPrice * l.quantity;
  }, 0);

  return (
    <div className="grid gap-6 md:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-black">Carrinho</h1>
          <p className="text-sm text-black/60">Revise seus itens antes de finalizar a compra.</p>
        </div>

        {lines.length === 0 ? (
          <Card>
            <CardHeader>
              <p className="font-semibold text-black">Seu carrinho está vazio</p>
              <p className="text-sm text-black/60">Escolha um produto para começar.</p>
            </CardHeader>
            <CardContent className="pt-0">
              <Link href="/products">
                <Button>Ver produtos</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {lines.map((line) => {
              const lineTotal = line.unitPrice * line.quantity;
              return (
                <Card key={`${line.productId}:${line.variantId}`} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="relative h-20 w-28 overflow-hidden rounded-xl border border-black/10 bg-white">
                        <Image src={line.image} alt={line.title} fill className="object-cover" unoptimized />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-black">{line.title}</p>
                        <p className="mt-1 text-sm text-black/60">SPH {line.sph}</p>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="h-9 w-9 rounded-xl border border-black/10 bg-white hover:bg-black/5"
                              onClick={() => setQty(line, Math.max(1, line.quantity - 1))}
                            >
                              −
                            </button>
                            <span className="min-w-10 text-center text-sm font-medium text-black">{line.quantity}</span>
                            <button
                              type="button"
                              className="h-9 w-9 rounded-xl border border-black/10 bg-white hover:bg-black/5"
                              onClick={() => setQty(line, Math.min(10, line.quantity + 1))}
                            >
                              +
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <p className="text-sm text-black/60">{formatBRL(line.unitPrice)} / un</p>
                            <p className="text-base font-semibold text-black">{formatBRL(lineTotal)}</p>
                            <button
                              type="button"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white hover:bg-black/5"
                              onClick={() => remove(line)}
                              aria-label="remove line"
                            >
                              <Trash2 className="h-4 w-4 text-black/70" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Card className="sticky top-24 h-fit">
        <CardHeader>
          <p className="text-sm font-semibold text-black">Resumo</p>
          <p className="text-sm text-black/60">Pagamento seguro com Pix ou Cartão.</p>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="flex items-center justify-between text-sm">
            <span className="text-black/60">Subtotal</span>
            <span className="font-medium text-black">{formatBRL(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-black/60">Entrega</span>
            <span className="font-medium text-black">{formatBRL(0)}</span>
          </div>
          <div className="h-px bg-black/10" />
          <div className="flex items-center justify-between">
            <span className="font-semibold text-black">Total</span>
            <span className="text-xl font-semibold text-black">{formatBRL(subtotal)}</span>
          </div>

          <Link href="/checkout">
            <Button size="lg" className="w-full" disabled={lines.length === 0}>
              Ir para o checkout
            </Button>
          </Link>
          <Link href="/products">
            <Button size="lg" variant="secondary" className="w-full">
              Continuar comprando
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}


