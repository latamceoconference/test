"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Carrinho com persistência em localStorage.
export type CartLine = {
  productId: string;
  variantId: string;
  sku: string;
  title: string;
  image: string;
  sph: string;
  unitPrice: number;
  quantity: number;
};

type CartStore = {
  lines: CartLine[];
  add: (line: CartLine) => void;
  setQty: (key: Pick<CartLine, "productId" | "variantId">, qty: number) => void;
  remove: (key: Pick<CartLine, "productId" | "variantId">) => void;
  clear: () => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      lines: [],
      add: (line) =>
        set((state) => {
          const idx = state.lines.findIndex(
            (l) => l.productId === line.productId && l.variantId === line.variantId
          );
          if (idx === -1) return { lines: [...state.lines, line] };
          const copy = [...state.lines];
          copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + line.quantity };
          return { lines: copy };
        }),
      setQty: (key, qty) =>
        set((state) => ({
          lines:
            qty <= 0
              ? state.lines.filter(
                  (l) => !(l.productId === key.productId && l.variantId === key.variantId)
                )
              : state.lines.map((l) =>
                  l.productId === key.productId && l.variantId === key.variantId
                    ? { ...l, quantity: qty }
                    : l
                )
        })),
      remove: (key) =>
        set((state) => ({
          lines: state.lines.filter(
            (l) => !(l.productId === key.productId && l.variantId === key.variantId)
          )
        })),
      clear: () => set({ lines: [] })
    }),
    {
      name: "lensstore.cart.v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines })
    }
  )
);


