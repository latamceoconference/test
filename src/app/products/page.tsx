import { Badge } from "@/components/ui/badge";
import { ProductsClient } from "@/app/products/products-client";
import { getCatalogProducts } from "@/lib/catalog";

export default async function ProductsPage() {
  const products = await getCatalogProducts();
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold text-black">Produtos</h1>
          <Badge>Busca • Filtros • Ordenação</Badge>
        </div>
        <p className="text-sm text-black/60">
          Catálogo com foco em conversão e escolha de grau (SPH).
        </p>
      </div>

      <ProductsClient initialProducts={products} />
    </div>
  );
}


