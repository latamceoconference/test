"use client";

import * as React from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import type { LensCategory, Product } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";

type SortKey = "popular" | "price_asc" | "price_desc";

function minPrice(p: Product) {
  return Math.min(...p.variants.map((v) => v.price));
}

const categories: { key: "all" | LensCategory; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "daily", label: "1-Day" },
  { key: "monthly", label: "Monthly" },
  { key: "toric", label: "Toric" },
  { key: "multifocal", label: "Multifocal" },
  { key: "color", label: "Color" }
];

export function ProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<(typeof categories)[number]["key"]>("all");
  const [sort, setSort] = React.useState<SortKey>("popular");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let items = initialProducts;

    if (category !== "all") items = items.filter((p) => p.category === category);
    if (q) {
      items = items.filter((p) => {
        const hay = `${p.name} ${p.brand} ${p.shortDescription}`.toLowerCase();
        return hay.includes(q);
      });
    }

    // "popular" mantém a ordem atual
    if (sort === "price_asc") items = [...items].sort((a, b) => minPrice(a) - minPrice(b));
    if (sort === "price_desc") items = [...items].sort((a, b) => minPrice(b) - minPrice(a));

    return items;
  }, [query, category, sort, initialProducts]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white/70 p-4 backdrop-blur md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por marca ou produto (ex: Acuvue, Alcon)"
              className="pl-10"
            />
          </div>
          <Badge className="hidden md:inline-flex">
            <SlidersHorizontal className="mr-1 h-3.5 w-3.5" />
            Filter
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-10 rounded-xl border border-black/10 bg-white/70 px-3 text-sm text-black outline-none focus:ring-2 focus:ring-black/10"
          >
            <option value="popular">Recomendados</option>
            <option value="price_asc">Menor preço</option>
            <option value="price_desc">Maior preço</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => {
          const active = c.key === category;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(c.key)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-colors",
                active ? "border-black bg-black text-white" : "border-black/10 bg-white/70 text-black/70 hover:bg-white"
              )}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-black/10 bg-white/70 p-8 text-center text-sm text-black/60">
          Nenhum produto encontrado.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}


