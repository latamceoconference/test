export type LensCategory = "daily" | "monthly" | "toric" | "multifocal" | "color";

/**
 * Em lojas de lentes, o Variant representa um SKU (preço/estoque por grau).
 * Aqui mantemos o essencial: SPH + preço + estoque.
 */
export interface ProductVariant {
  id: string;
  sku: string;
  /** SPH (grau). Ex: "-1.25", "+0.50" */
  sph: string;
  /** Preço (BRL) */
  price: number;
  /** Estoque */
  stock: number;
}

/**
 * Product é o “container” da página de produto.
 * A compra acontece nos variants (grau/SPH).
 */
export interface Product {
  id: string;
  name: string;
  brand: string;
  category: LensCategory;
  shortDescription: string;
  description: string;
  image: string; // caminho em public/ (ex: "/products/...")

  // atributos úteis para UX/filtros/SEO
  packSize: number; // ex: 30, 90, 6
  wearPeriod: "daily" | "monthly";
  baseCurve?: string; // BC
  diameter?: string; // DIA
  waterContentPercent?: number;
  uvBlocking?: boolean;

  variants: ProductVariant[];
}

export function getMinPrice(product: Product) {
  return Math.min(...product.variants.map((v) => v.price));
}

export function getProductById(id: string) {
  return products.find((p) => p.id === id) ?? null;
}

/**
 * Catálogo de exemplo (substitua por dados reais / Supabase).
 */
export const products: Product[] = [
  {
    id: "acuvue-oasys-1day-90",
    name: "ACUVUE OASYS 1-Day (90)",
    brand: "Johnson & Johnson",
    category: "daily",
    shortDescription: "Conforto o dia todo. Lente diária premium para rotina intensa.",
    description:
      "Texto de exemplo. Em produção, inclua nome oficial do produto e informações regulatórias. Selecione o grau (SPH) para ver preço e estoque.",
    image: "/file.svg",
    packSize: 90,
    wearPeriod: "daily",
    baseCurve: "8.5",
    diameter: "14.3",
    uvBlocking: true,
    waterContentPercent: 38,
    variants: [
      { id: "ao-090--0.50", sku: "AO1D90--0.50", sph: "-0.50", price: 219.9, stock: 18 },
      { id: "ao-090--1.00", sku: "AO1D90--1.00", sph: "-1.00", price: 219.9, stock: 12 },
      { id: "ao-090--1.25", sku: "AO1D90--1.25", sph: "-1.25", price: 219.9, stock: 6 },
      { id: "ao-090--2.00", sku: "AO1D90--2.00", sph: "-2.00", price: 219.9, stock: 2 },
      { id: "ao-090--3.00", sku: "AO1D90--3.00", sph: "-3.00", price: 219.9, stock: 0 }
    ]
  },
  {
    id: "dailies-total1-90",
    name: "DAILIES TOTAL1 (90)",
    brand: "Alcon",
    category: "daily",
    shortDescription: "Lente diária premium com conforto e visão nítida.",
    description:
      "Texto de exemplo. Na página do produto, destaque grau, estoque e preço. Um próximo passo comum é permitir seleção separada OD/OE.",
    image: "/globe.svg",
    packSize: 90,
    wearPeriod: "daily",
    baseCurve: "8.5",
    diameter: "14.1",
    waterContentPercent: 33,
    uvBlocking: false,
    variants: [
      { id: "dt1-090--0.25", sku: "DT1-90--0.25", sph: "-0.25", price: 239.9, stock: 14 },
      { id: "dt1-090--0.75", sku: "DT1-90--0.75", sph: "-0.75", price: 239.9, stock: 9 },
      { id: "dt1-090--1.50", sku: "DT1-90--1.50", sph: "-1.50", price: 239.9, stock: 5 },
      { id: "dt1-090--2.25", sku: "DT1-90--2.25", sph: "-2.25", price: 239.9, stock: 3 },
      { id: "dt1-090--4.00", sku: "DT1-90--4.00", sph: "-4.00", price: 249.9, stock: 1 }
    ]
  },
  {
    id: "air-optix-plus-hydraglyde-6",
    name: "AIR OPTIX plus HydraGlyde (6)",
    brand: "Alcon",
    category: "monthly",
    shortDescription: "Lente mensal. Ótima para rotina de limpeza e manutenção.",
    description:
      "Texto de exemplo. Lentes mensais combinam muito com recompra e recorrência.",
    image: "/window.svg",
    packSize: 6,
    wearPeriod: "monthly",
    baseCurve: "8.6",
    diameter: "14.2",
    uvBlocking: false,
    variants: [
      { id: "aop-006--0.50", sku: "AOP6--0.50", sph: "-0.50", price: 129.9, stock: 22 },
      { id: "aop-006--1.00", sku: "AOP6--1.00", sph: "-1.00", price: 129.9, stock: 17 },
      { id: "aop-006--1.75", sku: "AOP6--1.75", sph: "-1.75", price: 129.9, stock: 8 },
      { id: "aop-006--2.50", sku: "AOP6--2.50", sph: "-2.50", price: 129.9, stock: 4 },
      { id: "aop-006--6.00", sku: "AOP6--6.00", sph: "-6.00", price: 139.9, stock: 2 }
    ]
  },
  {
    id: "biofinity-6",
    name: "Biofinity (6)",
    brand: "CooperVision",
    category: "monthly",
    shortDescription: "Lente mensal com ótimo custo-benefício e conforto natural.",
    description:
      "Texto de exemplo. Comece com SPH e depois expanda para toric (CYL/AXIS) e multifocal (ADD) se necessário.",
    image: "/next.svg",
    packSize: 6,
    wearPeriod: "monthly",
    baseCurve: "8.6",
    diameter: "14.0",
    variants: [
      { id: "bio-006--0.25", sku: "BIO6--0.25", sph: "-0.25", price: 119.9, stock: 15 },
      { id: "bio-006--0.75", sku: "BIO6--0.75", sph: "-0.75", price: 119.9, stock: 11 },
      { id: "bio-006--1.25", sku: "BIO6--1.25", sph: "-1.25", price: 119.9, stock: 7 },
      { id: "bio-006--2.00", sku: "BIO6--2.00", sph: "-2.00", price: 119.9, stock: 4 },
      { id: "bio-006--5.50", sku: "BIO6--5.50", sph: "-5.50", price: 129.9, stock: 1 }
    ]
  }
];




