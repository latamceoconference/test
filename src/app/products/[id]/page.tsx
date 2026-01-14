import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getMinPrice } from "@/lib/products";
import { getCatalogProductById } from "@/lib/catalog";
import { formatBRL } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProductDetailBuyBox } from "@/components/product-detail-buy-box";
import { getCatalogProducts } from "@/lib/catalog";

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getCatalogProductById(id);
  if (!product) {
    const ids = (await getCatalogProducts()).map((p) => p.id);
    return (
      <div className="space-y-4">
        <Link href="/products" className="inline-flex items-center gap-2 text-sm text-black/70 hover:text-black">
          <ArrowLeft className="h-4 w-4" />
          Voltar para produtos
        </Link>

        <Card>
          <CardHeader>
            <h1 className="text-2xl font-semibold text-black">Produto não encontrado</h1>
            <p className="text-sm text-black/60">
              Não encontramos o produto com id <span className="font-mono">{id}</span>.
            </p>
            <p className="text-sm text-black/60">
              Dica: confira se esse id existe na tabela <span className="font-mono">public.products</span> (coluna{" "}
              <span className="font-mono">id</span>). Para diagnosticar, abra{" "}
              <span className="font-mono">/api/debug/catalog</span>.
            </p>
            <p className="text-sm text-black/60">
              Diagnóstico avançado: <span className="font-mono">/api/debug/product?id={id}</span>
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <Link href="/products" className="inline-flex">
              <Badge>Ver catálogo</Badge>
            </Link>
            <div className="mt-4 space-y-2 text-sm text-black/60">
              <p className="font-medium text-black/70">IDs disponíveis (para copiar e testar):</p>
              <ul className="list-disc pl-5">
                {ids.slice(0, 20).map((id) => (
                  <li key={id}>
                    <Link href={`/products/${id}`} className="font-mono hover:underline">
                      {id}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/products" className="inline-flex items-center gap-2 text-sm text-black/70 hover:text-black">
        <ArrowLeft className="h-4 w-4" />
        Voltar para produtos
      </Link>

      <div className="grid gap-6 md:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden">
          <CardHeader className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-black/50">{product.brand}</p>
              <h1 className="text-2xl font-semibold tracking-tight text-black">{product.name}</h1>
              <p className="mt-2 text-sm text-black/60">{product.shortDescription}</p>
            </div>
            <Badge className="shrink-0">from {formatBRL(getMinPrice(product))}</Badge>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-black/10 bg-white">
              <Image src={product.image} alt={product.name} fill className="object-cover" unoptimized />
            </div>

            <div className="mt-5 grid gap-3 rounded-2xl border border-black/10 bg-white/70 p-4 text-sm text-black/70">
              <div className="flex items-center justify-between">
                <span className="text-black/50">Conteúdo</span>
                <span className="font-medium">{product.packSize} unidades</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-black/50">Periodicidade</span>
                <span className="font-medium">{product.wearPeriod}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-black/50">BC</span>
                <span className="font-medium">{product.baseCurve ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-black/50">DIA</span>
                <span className="font-medium">{product.diameter ?? "—"}</span>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <h2 className="text-base font-semibold text-black">Descrição</h2>
              <p className="text-sm leading-6 text-black/65">{product.description}</p>
            </div>
          </CardContent>
        </Card>

        <ProductDetailBuyBox product={product} />
      </div>
    </div>
  );
}



