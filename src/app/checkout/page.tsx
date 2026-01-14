"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { z } from "zod";

import { useCartStore } from "@/store/cart";
import { formatBRL } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const CheckoutSchema = z.object({
  fullName: z.string().min(2, "Informe o nome completo."),
  email: z.string().email("E-mail inválido."),
  cpf: z
    .string()
    .min(11, "Informe o CPF.")
    .max(14, "CPF inválido."),
  phone: z.string().min(8, "Informe o telefone."),
  cep: z.string().min(8, "Informe o CEP."),
  addressLine1: z.string().min(3, "Informe o endereço."),
  city: z.string().min(2, "Informe a cidade."),
  state: z.string().min(2, "Informe o estado.")
});

type CheckoutForm = z.infer<typeof CheckoutSchema>;

type PayMethod = "pix" | "checkout_pro";

function buildItems(
  lines: {
    productId: string;
    variantId: string;
    sku: string;
    title: string;
    sph: string;
    unitPrice: number;
    quantity: number;
  }[]
) {
  return lines
    .map((l) => ({
      title: `${l.title} (SPH ${l.sph})`,
      sku: l.sku,
      product_id: l.productId,
      variant_id: l.variantId,
      quantity: l.quantity,
      unit_price: l.unitPrice
    }));
}

export default function CheckoutPage() {
  const lines = useCartStore((s) => s.lines);
  const clear = useCartStore((s) => s.clear);
  const { user } = useAuth();

  const subtotal = lines.reduce((sum, l) => {
    return sum + l.unitPrice * l.quantity;
  }, 0);

  const [form, setForm] = React.useState<CheckoutForm>({
    fullName: "",
    email: "",
    cpf: "",
    phone: "",
    cep: "",
    addressLine1: "",
    city: "",
    state: ""
  });
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [method, setMethod] = React.useState<PayMethod>("pix");
  const [pix, setPix] = React.useState<{ qr_code?: string; qr_code_base64?: string; order_id: string; payment_id: string } | null>(
    null
  );

  // Auto-fill from profile when logged in
  React.useEffect(() => {
    if (!user) return;
    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;

    supabase
      .from("profiles")
      .select("full_name,cpf,phone,cep,address_line1,city,state")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (!data) return;
        setForm((f) => ({
          ...f,
          fullName: (data as any).full_name ?? f.fullName,
          email: user.email ?? f.email,
          cpf: (data as any).cpf ?? f.cpf,
          phone: (data as any).phone ?? f.phone,
          cep: (data as any).cep ?? f.cep,
          addressLine1: (data as any).address_line1 ?? f.addressLine1,
          city: (data as any).city ?? f.city,
          state: (data as any).state ?? f.state
        }));
      });
  }, [user]);

  const pay = async () => {
    setError(null);
    const parsed = CheckoutSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Confira os dados informados.");
      return;
    }
    if (lines.length === 0) {
      setError("Seu carrinho está vazio.");
      return;
    }

    setLoading(true);
    try {
      // Save latest profile fields for logged-in users (best-effort)
      if (user) {
        const supabase = createBrowserSupabaseClient();
        await supabase
          ?.from("profiles")
          .update({
            full_name: parsed.data.fullName,
            cpf: parsed.data.cpf,
            phone: parsed.data.phone,
            cep: parsed.data.cep,
            address_line1: parsed.data.addressLine1,
            city: parsed.data.city,
            state: parsed.data.state,
            updated_at: new Date().toISOString()
          })
          .eq("id", user.id);
      }

      if (method === "pix") {
        const res = await fetch("/api/checkout/create-pix", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user?.id,
            customer: parsed.data,
            currency: "BRL",
            items: buildItems(lines)
          })
        });
        if (!res.ok) throw new Error(await res.text());
        const data = (await res.json()) as { order_id: string; payment_id: string; qr_code?: string; qr_code_base64?: string };
        setPix(data);
        setLoading(false);
        return;
      }

      const res = await fetch("/api/checkout/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id,
          customer: parsed.data,
          currency: "BRL",
          items: buildItems(lines)
        })
      });
      if (!res.ok) throw new Error(await res.text());

      const data = (await res.json()) as { init_point: string };

      // Esvazia o carrinho ao redirecionar para o checkout.
      // Em produção, o ideal é limpar após confirmação via webhook.
      clear();
      window.location.href = data.init_point;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido");
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-black">Checkout</h1>
          <p className="text-sm text-black/60">Pagamento com Pix e Cartão.</p>
        </div>

        <Card>
          <CardHeader>
            <p className="font-semibold text-black">Dados de entrega e pagamento</p>
            <p className="text-sm text-black/60">Preencha as informações para finalizar a compra.</p>
          </CardHeader>
          <CardContent className="grid gap-3 pt-0">
            <div className="grid gap-2">
              <Label>Forma de pagamento</Label>
              <div className="grid gap-2 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setMethod("pix")}
                  className={`h-11 rounded-xl border px-4 text-left text-sm ${
                    method === "pix" ? "border-black bg-black text-white" : "border-black/10 bg-white/70 text-black/80 hover:bg-white"
                  }`}
                >
                  Pix (QR Code)
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("checkout_pro")}
                  className={`h-11 rounded-xl border px-4 text-left text-sm ${
                    method === "checkout_pro"
                      ? "border-black bg-black text-white"
                      : "border-black/10 bg-white/70 text-black/80 hover:bg-white"
                  }`}
                >
                  Cartão
                </button>
              </div>
              <p className="text-xs text-black/50">
                Pix: mostra QR e código aqui. Cartão: você será redirecionado para finalizar o pagamento.
              </p>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-1">
                <Label>Nome completo</Label>
                <Input
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  placeholder="Nome completo"
                />
              </div>
              <div className="grid gap-1">
                <Label>E-mail</Label>
                <Input
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-1">
                <Label>CPF</Label>
                <Input
                  value={form.cpf}
                  onChange={(e) => setForm((f) => ({ ...f, cpf: e.target.value }))}
                  placeholder="000.000.000-00"
                />
              </div>
              <div className="grid gap-1">
                <Label>Telefone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-3">
              <div className="grid gap-1 md:col-span-1">
                <Label>CEP</Label>
                <Input
                  value={form.cep}
                  onChange={(e) => setForm((f) => ({ ...f, cep: e.target.value }))}
                  placeholder="00000-000"
                />
              </div>
              <div className="grid gap-1 md:col-span-2">
                <Label>Endereço</Label>
                <Input
                  value={form.addressLine1}
                  onChange={(e) => setForm((f) => ({ ...f, addressLine1: e.target.value }))}
                  placeholder="Rua / Número / Complemento"
                />
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-1">
                <Label>Cidade</Label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  placeholder="São Paulo"
                />
              </div>
              <div className="grid gap-1">
                <Label>Estado</Label>
                <Input
                  value={form.state}
                  onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                  placeholder="SP"
                />
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-500/20 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {pix ? (
              <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
                <p className="font-semibold text-black">Pix gerado</p>
                <p className="mt-1 text-sm text-black/60">
                  Escaneie o QR Code ou copie o código. Seu pedido será confirmado via webhook após o pagamento.
                </p>
                {pix.qr_code_base64 ? (
                  <div className="mt-3 flex justify-center">
                    <img
                      src={`data:image/png;base64,${pix.qr_code_base64}`}
                      alt="QR Code Pix"
                      className="h-56 w-56 rounded-xl border border-black/10 bg-white p-2"
                    />
                  </div>
                ) : null}
                {pix.qr_code ? (
                  <div className="mt-3 grid gap-2">
                    <Label>Código Pix (copia e cola)</Label>
                    <textarea
                      readOnly
                      value={pix.qr_code}
                      className="min-h-24 w-full rounded-xl border border-black/10 bg-white/70 p-3 text-xs text-black/80 outline-none"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={async () => {
                        await navigator.clipboard.writeText(pix.qr_code ?? "");
                      }}
                    >
                      Copiar código Pix
                    </Button>
                    <p className="text-xs text-black/50">
                      order_id: <span className="font-mono">{pix.order_id}</span> • payment_id:{" "}
                      <span className="font-mono">{pix.payment_id}</span>
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}

            <Button size="lg" onClick={pay} disabled={loading || lines.length === 0}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {lines.length === 0
                ? "Carrinho vazio"
                : method === "pix"
                  ? `Gerar Pix ${formatBRL(subtotal)}`
                  : `Pagar ${formatBRL(subtotal)}`}
            </Button>

            <Link href="/cart" className="text-sm text-black/60 hover:text-black">
              ← Voltar ao carrinho
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="sticky top-24 h-fit">
        <CardHeader>
          <p className="text-sm font-semibold text-black">Resumo do pedido</p>
          <p className="text-sm text-black/60">Frete e impostos serão calculados no checkout.</p>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="flex items-center justify-between text-sm">
            <span className="text-black/60">Subtotal</span>
            <span className="font-medium text-black">{formatBRL(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-black/60">Entrega</span>
            <span className="font-medium text-black">{formatBRL(0)}</span>
          </div>
          <div className="h-px bg-black/10" />
          <div className="flex items-center justify-between">
            <span className="font-semibold text-black">Total</span>
            <span className="text-xl font-semibold text-black">{formatBRL(subtotal)}</span>
          </div>
          <p className="text-xs text-black/50">
            Em produção: criar pedido → gerar preference → confirmar por webhook → atualizar status do pedido.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


