"use client";

import Link from "next/link";
import { LogIn, LogOut, ShoppingCart, Sparkles, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useCartStore } from "@/store/cart";
import { useAuth } from "@/lib/auth";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function Header() {
  const count = useCartStore((s) => s.lines.reduce((sum, l) => sum + l.quantity, 0));
  const { user, loading } = useAuth();
  const pathname = usePathname();

  const nav = [
    { href: "/", label: "Início" },
    { href: "/products", label: "Produtos" },
    { href: "/checkout", label: "Checkout" },
    { href: "/policies/shipping", label: "Entrega & Trocas" }
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight text-slate-900">LensStore</p>
            <p className="text-xs text-slate-500">Lentes de contato</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : (pathname ?? "").startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("group relative text-sm font-medium transition-colors", active ? "text-slate-900" : "text-slate-600 hover:text-slate-900")}
              >
                {item.label}
                <span
                  className={cn(
                    "absolute -bottom-2 left-0 h-[2px] w-full rounded-full bg-cyan-500 transition-opacity",
                    active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {!loading && !user ? (
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-3 text-sm font-medium text-slate-900 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Entrar</span>
            </Link>
          ) : null}

          {!loading && user ? (
            <>
              <Link
                href="/account"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-3 text-sm font-medium text-slate-900 shadow-sm hover:bg-gray-50 transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Minha conta</span>
              </Link>
              <button
                type="button"
                onClick={async () => {
                  const supabase = createBrowserSupabaseClient();
                  await supabase?.auth.signOut();
                }}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-3 text-sm font-medium text-slate-900 shadow-sm hover:bg-gray-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </>
          ) : null}

          <Link
            href="/cart"
            className={cn(
              "relative inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-3 text-sm font-medium text-slate-900 shadow-sm hover:bg-gray-50 transition-colors"
            )}
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Carrinho</span>
            <span className="ml-1 inline-flex min-w-6 items-center justify-center rounded-full bg-slate-900 px-2 py-0.5 text-xs text-white">
              {count}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}



