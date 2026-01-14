import { NextResponse } from "next/server";
import { z } from "zod";
import { MercadoPagoConfig, Preference } from "mercadopago";
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
  if (!parsed.success) {
    return new NextResponse(parsed.error.message, { status: 400 });
  }

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;

  const supabase = createServerSupabaseClient();
  const subtotal = parsed.data.items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);

  // 1) Create order (server-side)
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
  if (oiErr) {
    return new NextResponse(`Supabase order_items insert error: ${oiErr.message}`, { status: 502 });
  }

  // 3) Reserve stock immediately (prevents oversell).
  // NOTE: In a stricter flow you may reserve and release on timeout/cancel.
  const { error: rsErr } = await supabase.rpc("reserve_stock", { p_order_id: orderId });
  if (rsErr) {
    await supabase.from("orders").update({ status: "failed" }).eq("id", orderId);
    return new NextResponse(`Stock reservation failed: ${rsErr.message}`, { status: 409 });
  }

  // Mock mode: se não houver token, retorna uma URL de resultado para testar o fluxo
  if (!token) {
    await supabase
      .from("orders")
      .update({ status: "paid", mp_payment_id: "mock_123" })
      .eq("id", orderId);

    const url = new URL("/checkout/result", baseUrl);
    url.searchParams.set("mode", "mock");
    url.searchParams.set("status", "approved");
    url.searchParams.set("payment_id", "mock_123");
    url.searchParams.set("order_id", orderId);
    return NextResponse.json({ init_point: url.toString() });
  }

  const success = new URL("/checkout/result", baseUrl);
  success.searchParams.set("mode", "mercadopago");
  success.searchParams.set("status", "success");
  success.searchParams.set("order_id", orderId);
  const pending = new URL("/checkout/result", baseUrl);
  pending.searchParams.set("mode", "mercadopago");
  pending.searchParams.set("status", "pending");
  pending.searchParams.set("order_id", orderId);
  const failure = new URL("/checkout/result", baseUrl);
  failure.searchParams.set("mode", "mercadopago");
  failure.searchParams.set("status", "failure");
  failure.searchParams.set("order_id", orderId);

  const client = new MercadoPagoConfig({ accessToken: token });
  const preference = new Preference(client);

  const mpRes = await preference.create({
    body: {
      items: parsed.data.items.map((i) => ({
        title: i.title,
        quantity: i.quantity,
        currency_id: "BRL",
        unit_price: i.unit_price
      })),
      external_reference: orderId,
      payer: {
        name: parsed.data.customer.fullName,
        email: parsed.data.customer.email,
        identification: {
          type: "CPF",
          number: parsed.data.customer.cpf.replace(/\D/g, "")
        }
      },
      notification_url: new URL("/api/mercadopago/webhook", baseUrl).toString(),
      back_urls: {
        success: success.toString(),
        pending: pending.toString(),
        failure: failure.toString()
      },
      auto_return: "approved"
    }
  });

  const preferenceId = (mpRes as any)?.id as string | undefined;
  const initPoint = (mpRes as any)?.init_point as string | undefined;
  if (!initPoint) {
    return new NextResponse("Mercado Pago init_point missing", { status: 502 });
  }

  if (preferenceId) {
    await supabase.from("orders").update({ mp_preference_id: preferenceId }).eq("id", orderId);
  }

  return NextResponse.json({ init_point: initPoint });
}



