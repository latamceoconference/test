"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import type { ProductVariant } from "@/lib/products";

type Props = {
  variants: ProductVariant[];
  value: ProductVariant | null;
  onChange: (v: ProductVariant) => void;
};

/**
 * UX crítico em lojas de lentes:
 * - Seleção de SPH rápida, sem erro e com estoque/preço visíveis
 * - Grade de botões mobile-first
 */
export function VariantSelector({ variants, value, onChange }: Props) {
  const [selectedId, setSelectedId] = React.useState<string>(value?.id ?? "");

  React.useEffect(() => {
    setSelectedId(value?.id ?? "");
  }, [value?.id]);

  const sorted = React.useMemo(() => {
    // Ordena SPH como número quando possível
    const toNum = (s: string) => {
      const n = Number(s.replace(",", "."));
      return Number.isFinite(n) ? n : 0;
    };
    return [...variants].sort((a, b) => toNum(a.sph) - toNum(b.sph));
  }, [variants]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-black">Selecione o grau (SPH)</p>
        <p className="text-xs text-black/50">{value ? `Selecionado: ${value.sph}` : "Seleção necessária"}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {sorted.map((v) => {
          const active = v.id === selectedId;
          const disabled = v.stock <= 0;
          return (
            <button
              key={v.id}
              type="button"
              disabled={disabled}
              onClick={() => {
                setSelectedId(v.id);
                onChange(v);
              }}
              className={cn(
                "group relative rounded-xl border px-3 py-3 text-left transition-colors",
                active ? "border-black bg-black text-white" : "border-black/10 bg-white/70 hover:bg-white",
                disabled && "opacity-50"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={cn("text-sm font-semibold", active ? "text-white" : "text-black")}>
                  {v.sph}
                </span>
                <span className={cn("text-[11px]", active ? "text-white/70" : "text-black/45")}>
                  {disabled ? "Sem estoque" : `Estoque ${v.stock}`}
                </span>
              </div>
              <div className={cn("mt-1 text-[11px]", active ? "text-white/70" : "text-black/45")}>
                {v.price.toFixed(2)} BRL
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-black/50">Dica: adicionar seleção separada OD/OE melhora a conversão em lojas de lentes.</p>
    </div>
  );
}



