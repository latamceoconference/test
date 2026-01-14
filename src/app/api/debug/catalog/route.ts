import { NextResponse } from "next/server";
import { createServerAnonSupabaseClient } from "@/lib/supabase/server-anon";

export async function GET() {
  const hasEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!hasEnv) {
    return NextResponse.json({
      ok: false,
      supabase: false,
      reason: "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY"
    });
  }

  try {
    const supabase = createServerAnonSupabaseClient();

    const { data: products, error: pErr } = await supabase
      .from("products")
      .select("id,is_active,created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (pErr) throw new Error(`products: ${pErr.message}`);

    const { data: variants, error: vErr } = await supabase
      .from("product_variants")
      .select("id,product_id,is_active,stock,price")
      .limit(20);
    if (vErr) throw new Error(`product_variants: ${vErr.message}`);

    return NextResponse.json({
      ok: true,
      supabase: true,
      products_count: products?.length ?? 0,
      variants_count: variants?.length ?? 0,
      products_sample: products ?? [],
      variants_sample: variants ?? []
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        supabase: true,
        error: e instanceof Error ? e.message : String(e)
      },
      { status: 500 }
    );
  }
}


