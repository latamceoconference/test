import { getCatalogProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import { HeroBanner } from "@/components/HeroBanner";
import { BenefitBar } from "@/components/BenefitBar";
import Link from "next/link";

export default async function HomePage() {
  const products = await getCatalogProducts();
  const featured = products.slice(0, 3);

  return (
    <div className="-mx-4 -my-8 bg-gray-50 px-4 py-10">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <HeroBanner />
        <BenefitBar />

        <section className="space-y-4 pt-2">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">Destaques</h2>
              <p className="text-sm text-slate-600">Seleção curada de lentes — escolha o grau e finalize com segurança.</p>
            </div>
            <Link href="/products" className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">
              Ver todos →
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {featured.map((p) => (
              <div key={p.id} className="transition-all hover:-translate-y-0.5 hover:shadow-sm">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
