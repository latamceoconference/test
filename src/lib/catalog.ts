import type { Product, ProductVariant } from "@/lib/products";
import { products as localProducts } from "@/lib/products";
import { createServerAnonSupabaseClient } from "@/lib/supabase/server-anon";

type DbProduct = {
  id: string;
  name: string;
  brand: string;
  category: Product["category"];
  short_description: string;
  description: string;
  image_url: string;
  pack_size: number;
  wear_period: Product["wearPeriod"];
  base_curve: string | null;
  diameter: string | null;
  water_content_percent: number | null;
  uv_blocking: boolean | null;
  is_active: boolean;
};

type DbVariant = {
  id: string;
  product_id: string;
  sku: string;
  sph: string;
  price: string | number;
  stock: number;
  is_active: boolean;
};

function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function mapProduct(p: DbProduct, variants: DbVariant[]): Product {
  const mappedVariants: ProductVariant[] = variants
    .filter((v) => v.is_active)
    .map((v) => ({
      id: v.id,
      sku: v.sku,
      sph: v.sph,
      price: typeof v.price === "string" ? Number(v.price) : v.price,
      stock: v.stock
    }));

  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    shortDescription: p.short_description,
    description: p.description,
    image: p.image_url,
    packSize: p.pack_size,
    wearPeriod: p.wear_period,
    baseCurve: p.base_curve ?? undefined,
    diameter: p.diameter ?? undefined,
    waterContentPercent: p.water_content_percent ?? undefined,
    uvBlocking: p.uv_blocking ?? undefined,
    variants: mappedVariants
  };
}

export async function getCatalogProducts(): Promise<Product[]> {
  if (!hasSupabaseEnv()) return localProducts;

  const supabase = createServerAnonSupabaseClient();

  const { data: products, error: pErr } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (pErr) throw new Error(`Supabase products error: ${pErr.message}`);

  const { data: variants, error: vErr } = await supabase
    .from("product_variants")
    .select("*")
    .eq("is_active", true);
  if (vErr) throw new Error(`Supabase variants error: ${vErr.message}`);

  const byProduct = new Map<string, DbVariant[]>();
  for (const v of (variants ?? []) as DbVariant[]) {
    const list = byProduct.get(v.product_id) ?? [];
    list.push(v);
    byProduct.set(v.product_id, list);
  }

  return ((products ?? []) as DbProduct[]).map((p) => mapProduct(p, byProduct.get(p.id) ?? []));
}

export async function getCatalogProductById(id: string): Promise<Product | null> {
  if (!hasSupabaseEnv()) return localProducts.find((p) => p.id === id) ?? null;

  const supabase = createServerAnonSupabaseClient();

  const { data: p, error: pErr } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();
  if (pErr) throw new Error(`Supabase product(${id}) error: ${pErr.message}`);
  if (!p) return null;

  const { data: variants, error: vErr } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", id)
    .eq("is_active", true);
  if (vErr) throw new Error(`Supabase variants(${id}) error: ${vErr.message}`);

  return mapProduct(p as DbProduct, (variants ?? []) as DbVariant[]);
}



