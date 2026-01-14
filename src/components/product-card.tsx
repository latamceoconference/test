import Image from "next/image";
import Link from "next/link";

import type { Product } from "@/lib/products";
import { getMinPrice } from "@/lib/products";
import { formatBRL } from "@/lib/money";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function categoryLabel(p: Product) {
  switch (p.category) {
    case "daily":
      return "1-Day";
    case "monthly":
      return "Monthly";
    case "toric":
      return "Toric";
    case "multifocal":
      return "Multifocal";
    case "color":
      return "Color";
  }
}

export function ProductCard({ product }: { product: Product }) {
  const minPrice = getMinPrice(product);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs text-black/50">{product.brand}</p>
          <h3 className="truncate text-base font-semibold text-black">{product.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-black/60">{product.shortDescription}</p>
        </div>
        <Badge>{categoryLabel(product)}</Badge>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-black/10 bg-white">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            // SVG/recursos locais: evita problemas de otimização durante o desenvolvimento
            unoptimized
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-black/60">A partir de</p>
          <p className="text-lg font-semibold text-black">{formatBRL(minPrice)}</p>
        </div>

        <Link
          href={`/products/${product.id}`}
          className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-black px-4 text-sm font-medium text-white hover:opacity-90"
        >
          Ver detalhes
        </Link>
      </CardContent>
    </Card>
  );
}



