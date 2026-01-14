"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { KeyRound, MapPin, Package, User } from "lucide-react";

import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/cn";

const nav = [
  { href: "/account/profile", label: "Perfil e endereço", icon: MapPin },
  { href: "/account/orders", label: "Pedidos", icon: Package },
  { href: "/account/security", label: "Segurança", icon: KeyRound }
] as const;

export function AccountShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (loading) return;
    if (!user) router.replace(`/login?returnTo=${encodeURIComponent(pathname ?? "/account")}`);
  }, [loading, user, router, pathname]);

  return (
    <div className="grid gap-6 md:grid-cols-[260px_1fr]">
      <aside className="h-fit rounded-2xl border border-black/10 bg-white/70 p-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-black text-white">
            <User className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-black">Minha conta</p>
            <p className="truncate text-xs text-black/50">{user?.email ?? "—"}</p>
          </div>
        </div>

        <nav className="mt-4 grid gap-1">
          {nav.map((i) => {
            const active = (pathname ?? "").startsWith(i.href);
            const Icon = i.icon;
            return (
              <Link
                key={i.href}
                href={i.href}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors",
                  active ? "bg-black text-white" : "text-black/70 hover:bg-black/5 hover:text-black"
                )}
              >
                <Icon className="h-4 w-4" />
                {i.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 rounded-xl border border-black/10 bg-white/70 p-3 text-xs text-black/60">
          Dica: mantenha seu endereço atualizado para recomprar em poucos cliques.
        </div>
      </aside>

      <section className="min-w-0">{children}</section>
    </div>
  );
}


