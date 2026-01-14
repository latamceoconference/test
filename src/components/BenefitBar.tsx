import { Headset, ShieldCheck, Truck } from "lucide-react";

const items = [
  {
    icon: Truck,
    title: "Entrega Rápida",
    desc: "Prazo e rastreio com transparência."
  },
  {
    icon: Headset,
    title: "Atendimento Especializado",
    desc: "Suporte para escolher o grau certo."
  },
  {
    icon: ShieldCheck,
    title: "Autenticidade Garantida",
    desc: "Produtos originais e seguros."
  }
] as const;

export function BenefitBar() {
  return (
    <section className="rounded-2xl border border-black/10 bg-white">
      <div className="grid gap-4 px-5 py-4 md:grid-cols-3">
        {items.map((i) => {
          const Icon = i.icon;
          return (
            <div key={i.title} className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gray-50 text-slate-900">
                <Icon className="h-5 w-5 text-cyan-500" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{i.title}</p>
                <p className="text-xs text-slate-600">{i.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}


