import Link from "next/link";
import { CreditCard, Headset, QrCode, RefreshCcw, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-14 border-t border-black/10 bg-white">
      {/* trust strip */}
      <div className="bg-gray-50">
        <div className="mx-auto grid max-w-6xl gap-3 px-4 py-6 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-900 shadow-sm ring-1 ring-black/5">
              <ShieldCheck className="h-5 w-5 text-cyan-500" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Autenticidade garantida</p>
              <p className="text-xs text-slate-600">Produtos originais e compra com transparência.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-900 shadow-sm ring-1 ring-black/5">
              <Headset className="h-5 w-5 text-cyan-500" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Atendimento especializado</p>
              <p className="text-xs text-slate-600">Ajuda para escolher seu grau e finalizar a compra.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-900 shadow-sm ring-1 ring-black/5">
              <RefreshCcw className="h-5 w-5 text-cyan-500" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Troca & devolução</p>
              <p className="text-xs text-slate-600">Políticas claras para comprar com confiança.</p>
            </div>
          </div>
        </div>
      </div>

      {/* main footer */}
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.9fr_0.9fr_1fr]">
          <div className="space-y-3">
            <p className="text-sm font-semibold tracking-tight text-slate-900">LensStore</p>
            <p className="text-sm text-slate-600">
              Uma experiência de compra focada em conforto, segurança e confiança — do grau ao checkout.
            </p>

            <div className="mt-4 grid gap-2 rounded-2xl border border-black/10 bg-gray-50 p-4">
              <p className="text-xs font-semibold text-slate-900">Meios de pagamento</p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white px-2.5 py-1">
                  <QrCode className="h-4 w-4 text-cyan-500" />
                  Pix
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white px-2.5 py-1">
                  <CreditCard className="h-4 w-4 text-cyan-500" />
                  Cartão
                </span>
                <span className="text-slate-500">Principais bandeiras</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <p className="font-semibold text-slate-900">Atendimento</p>
            <div className="grid gap-2 text-slate-600">
              <p className="text-xs text-slate-500">Horário comercial (Brasil)</p>
              <a className="hover:text-slate-900 transition-colors" href="mailto:suporte@lensstore.com">
                suporte@lensstore.com
              </a>
              <a className="hover:text-slate-900 transition-colors" href="https://wa.me/5500000000000">
                WhatsApp: +55 (00) 00000-0000
              </a>
              <p className="text-xs text-slate-500">
                * Substitua por seus contatos reais antes de publicar.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <p className="font-semibold text-slate-900">Informações</p>
            <div className="grid gap-2 text-slate-600">
              <Link className="hover:text-slate-900 transition-colors" href="/policies/shipping">
                Entrega
              </Link>
              <Link className="hover:text-slate-900 transition-colors" href="/policies/returns">
                Trocas e Devoluções
              </Link>
              <Link className="hover:text-slate-900 transition-colors" href="/policies/privacy">
                Política de Privacidade
              </Link>
              <Link className="hover:text-slate-900 transition-colors" href="/policies/terms">
                Termos de Uso
              </Link>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <p className="font-semibold text-slate-900">Empresa</p>
            <div className="grid gap-2 text-slate-600">
              <p>
                <span className="text-slate-500">Razão social:</span> LensStore LTDA (exemplo)
              </p>
              <p>
                <span className="text-slate-500">CNPJ:</span> 00.000.000/0000-00 (exemplo)
              </p>
              <p className="text-xs text-slate-500">
                * Ajuste com seus dados reais (obrigatório no Brasil).
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-black/10 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} LensStore. Todos os direitos reservados.</p>
          <p className="text-xs text-slate-500">
            Conteúdo informativo — consulte seu oftalmologista para prescrição.
          </p>
        </div>
      </div>
    </footer>
  );
}


