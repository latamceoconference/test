import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function CheckoutResultPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  // Our app params (mock / internal)
  const mode = (searchParams.mode as string | undefined) ?? "unknown";
  const status =
    (searchParams.status as string | undefined) ??
    // Mercado Pago often returns these instead of our custom `status`
    (searchParams.collection_status as string | undefined) ??
    (searchParams.status as string | undefined) ??
    "unknown";

  const paymentId =
    (searchParams.payment_id as string | undefined) ??
    // Mercado Pago common params
    (searchParams.collection_id as string | undefined) ??
    (searchParams.payment_id as string | undefined) ??
    undefined;

  const orderId =
    (searchParams.order_id as string | undefined) ??
    // Mercado Pago external_reference maps to our orderId
    (searchParams.external_reference as string | undefined) ??
    undefined;

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-black">Resultado do pagamento</h1>
            <Badge>{mode}</Badge>
          </div>
          <p className="text-sm text-black/60">
            O Checkout Pro redireciona via <span className="font-mono">back_urls</span>. Em produção, confirme via webhook.
          </p>
        </CardHeader>
        <CardContent className="space-y-3 pt-0 text-sm">
          <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
            <p>
              <span className="text-black/60">status:</span>{" "}
              <span className="font-medium text-black">{status}</span>
            </p>
            <p>
              <span className="text-black/60">payment_id:</span>{" "}
              <span className="font-medium text-black">{paymentId ?? "—"}</span>
            </p>
            <p>
              <span className="text-black/60">order_id:</span>{" "}
              <span className="font-medium text-black">{orderId ?? "—"}</span>
            </p>
          </div>
          {status === "unknown" && !paymentId && !orderId ? (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Você chegou aqui sem parâmetros de retorno. Isso pode acontecer se você abriu esta página manualmente ou se
              o provedor de pagamento não retornou dados. Volte ao checkout e tente novamente.
            </div>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/products"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-black px-4 text-sm font-medium text-white hover:opacity-90"
            >
              Continuar comprando
            </Link>
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-black/10 bg-white/70 px-4 text-sm font-medium hover:bg-white"
            >
              Voltar ao início
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



