import { NextResponse } from "next/server";
import { createServerAnonSupabaseClient } from "@/lib/supabase/server-anon";

function describeString(s: string) {
  return {
    value: s,
    length: s.length,
    codepoints_hex: Array.from(s).map((ch) => ch.codePointAt(0)?.toString(16)).filter(Boolean)
  };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id") ?? "";
  const hasEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!hasEnv) {
    return NextResponse.json({
      ok: false,
      supabase: false,
      reason: "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY"
    });
  }

  const supabase = createServerAnonSupabaseClient();

  // Exact match
  const { data: exact, error: eErr } = await supabase
    .from("products")
    .select("id,is_active")
    .eq("id", id)
    .maybeSingle();
  if (eErr) {
    return NextResponse.json({ ok: false, error: `exact: ${eErr.message}` }, { status: 500 });
  }

  // Similar (contains)
  const { data: contains, error: cErr } = await supabase
    .from("products")
    .select("id,is_active")
    .ilike("id", `%${id}%`)
    .limit(20);
  if (cErr) {
    return NextResponse.json({ ok: false, error: `contains: ${cErr.message}` }, { status: 500 });
  }

  // List (active)
  const { data: list, error: lErr } = await supabase
    .from("products")
    .select("id,is_active")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(50);
  if (lErr) {
    return NextResponse.json({ ok: false, error: `list: ${lErr.message}` }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    requested: describeString(id),
    exact_found: Boolean(exact),
    exact,
    contains: contains ?? [],
    active_ids: (list ?? []).map((x) => x.id)
  });
}


