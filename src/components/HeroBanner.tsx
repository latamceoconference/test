 "use client";

import Link from "next/link";
import * as React from "react";
import { BadgeCheck, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

export function HeroBanner() {
  const [photoOk, setPhotoOk] = React.useState(true);

  return (
    <section className="relative overflow-hidden rounded-3xl bg-slate-900">
      {/* subtle medical background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.18),transparent_55%),radial-gradient(circle_at_80%_10%,rgba(148,163,184,0.18),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/35" />
      </div>

      <div className="relative grid gap-10 p-8 md:grid-cols-[1.05fr_0.95fr] md:items-center md:p-12">
        {/* Left: copy */}
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            <span className="font-medium">Garantia de Autenticidade</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
              Visão Perfeita. <span className="text-cyan-400">Conforto Absoluto.</span>
            </h1>
            <p className="max-w-xl text-sm leading-6 text-white/75 md:text-base">
              As marcas que seus olhos confiam: Acuvue, Biofinity e mais. Compra segura com Pix e Cartão.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/products">
              <Button
                size="lg"
                className="w-full bg-cyan-500 text-slate-900 hover:bg-cyan-400 sm:w-auto transition-colors"
              >
                Ver produtos
              </Button>
            </Link>
            <Link href="/account/profile">
              <Button
                size="lg"
                variant="secondary"
                className="w-full border border-white/15 bg-white/5 text-white hover:bg-white/10 sm:w-auto transition-colors"
              >
                Salvar meu grau
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-white/70">
            <span className="inline-flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-cyan-400" />
              Pagamento protegido
            </span>
            <span className="h-4 w-px bg-white/15" />
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              Catálogo com estoque em tempo real
            </span>
          </div>
        </div>

        {/* Right: image blending */}
        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-cyan-500/10" />
            {photoOk ? (
              <img
                src="/images/hero-photo.jpg"
                alt="Modelo usando lentes de contato — visão clara"
                className="absolute inset-0 h-full w-full object-cover opacity-90 mix-blend-screen"
                onError={() => setPhotoOk(false)}
              />
            ) : (
              <img
                src="/images/hero-vision.svg"
                alt="Lentes de contato — visão clara"
                className="absolute inset-0 h-full w-full object-cover opacity-95"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-l from-slate-900/0 via-slate-900/10 to-slate-900/30" />
          </div>
          <p className="mt-2 text-xs text-white/50">
            Dica: coloque uma foto em <span className="font-mono">public/images/hero-photo.jpg</span> para um visual
            realista.
          </p>
        </div>
      </div>
    </section>
  );
}


