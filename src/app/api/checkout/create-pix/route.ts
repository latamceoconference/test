import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const BodySchema = z.object({
  user_id: z.string().uuid().optional(),
  customer: z.object({
    fullName: z.string(),
    email: z.string(),
    cpf: z.string(),
    phone: z.string(),
    cep: z.string(),
    addressLine1: z.string(),
    city: z.string(),
    state: z.string()
  }),
  currency: z.literal("BRL"),
  items: z
    .array(
      z.object({
        title: z.string(),
        sku: z.string(),
        product_id: z.string().optional(),
        variant_id: z.string().optional(),
        quantity: z.number().int().positive(),
        unit_price: z.number().positive()
      })
    )
    .min(1)
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) return new NextResponse(parsed.error.message, { status: 400 });

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
  if (!token) return new NextResponse("Missing MERCADOPAGO_ACCESS_TOKEN", { status: 400 });

  const supabase = createServerSupabaseClient();
  const subtotal = parsed.data.items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);

  // 1) Create order
  const { data: orderRow, error: oErr } = await supabase
    .from("orders")
    .insert({
      status: "pending_payment",
      currency: "BRL",
      subtotal,
      customer: parsed.data.customer,
      user_id: parsed.data.user_id
    })
    .select("id")
    .single();
  if (oErr || !orderRow?.id) {
    return new NextResponse(`Supabase order insert error: ${oErr?.message ?? "unknown"}`, { status: 502 });
  }
  const orderId = orderRow.id as string;

  // 2) Insert order items
  const { error: oiErr } = await supabase.from("order_items").insert(
    parsed.data.items.map((i) => ({
      order_id: orderId,
      product_id: i.product_id ?? "unknown",
      variant_id: i.variant_id ?? "unknown",
      title: i.title,
      quantity: i.quantity,
      unit_price: i.unit_price
    }))
  );
  if (oiErr) return new NextResponse(`Supabase order_items insert error: ${oiErr.message}`, { status: 502 });

  // 3) Reserve stock
  const { error: rsErr } = await supabase.rpc("reserve_stock", { p_order_id: orderId });
  if (rsErr) {
    await supabase.from("orders").update({ status: "failed" }).eq("id", orderId);
    return new NextResponse(`Stock reservation failed: ${rsErr.message}`, { status: 409 });
  }

  // 4) Create PIX payment (returns QR code)
  const payerName = parsed.data.customer.fullName.trim();
  const [firstName, ...rest] = payerName.split(/\s+/);
  const lastName = rest.join(" ") || undefined;

  const mpRes = await fetch("https://api.mercadopago.com/v1/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": orderId
    },
    body: JSON.stringify({
      transaction_amount: subtotal,
      description: `Pedido ${orderId}`,
      payment_method_id: "pix",
      external_reference: orderId,
      payer: {
        email: parsed.data.customer.email,
        first_name: firstName,
        last_name: lastName,
        identification: {
          type: "CPF",
          number: parsed.data.customer.cpf.replace(/\D/g, "")
        }
      },
      notification_url: new URL("/api/mercadopago/webhook", baseUrl).toString()
    })
  });

  const mpJson = await mpRes.json().catch(() => null);
  if (!mpRes.ok) {
    // Release reserved stock if payment creation failed
    await supabase.rpc("release_stock", { p_order_id: orderId });
    await supabase.from("orders").update({ status: "failed" }).eq("id", orderId);
    return new NextResponse(JSON.stringify(mpJson ?? { error: "Mercado Pago create pix failed" }), { status: 502 });
  }

  const paymentId = String(mpJson?.id ?? "");
  const tx = mpJson?.point_of_interaction?.transaction_data ?? null;
  const qrCode = (tx?.qr_code as string | undefined) ?? undefined;
  const qrBase64 = (tx?.qr_code_base64 as string | undefined) ?? undefined;

  await supabase.from("orders").update({ mp_payment_id: paymentId }).eq("id", orderId);

  return NextResponse.json({
    order_id: orderId,
    payment_id: paymentId,
    qr_code: qrCode,
    qr_code_base64: qrBase64
  });
}


