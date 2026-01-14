import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Mercado Pago envia notificações para notification_url.
// Em produção, valide assinatura (quando aplicável) e trate idempotência.
export async function POST(req: Request) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) return new NextResponse("Missing MERCADOPAGO_ACCESS_TOKEN", { status: 400 });

  const payload = await req.json().catch(() => null);

  // Formatos comuns:
  // - { type: "payment", data: { id: "123" } }
  // - querystring pode conter `data.id` em alguns casos
  const type = payload?.type ?? payload?.topic;
  const paymentId =
    payload?.data?.id ??
    payload?.id ??
    null;

  if (!paymentId || (type && type !== "payment")) {
    return NextResponse.json({ ok: true });
  }

  // Busca pagamento para obter status + external_reference(orderId)
  const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const mpJson = await mpRes.json().catch(() => null);
  if (!mpRes.ok) {
    return new NextResponse(JSON.stringify(mpJson ?? { error: "Mercado Pago fetch failed" }), { status: 502 });
  }

  const status = mpJson?.status as string | undefined; // approved, pending, rejected, cancelled...
  const orderId = mpJson?.external_reference as string | undefined;
  if (!orderId) return NextResponse.json({ ok: true });

  const mapped =
    status === "approved"
      ? "paid"
      : status === "cancelled"
        ? "cancelled"
        : status === "rejected"
          ? "failed"
          : "pending_payment";

  const supabase = createServerSupabaseClient();
  await supabase
    .from("orders")
    .update({ status: mapped, mp_payment_id: String(paymentId) })
    .eq("id", orderId);

  // If payment failed/cancelled, release reserved stock.
  if (mapped === "failed" || mapped === "cancelled") {
    await supabase.rpc("release_stock", { p_order_id: orderId });
  }

  return NextResponse.json({ ok: true });
}


