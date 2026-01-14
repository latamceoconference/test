import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ShippingPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold text-black">Entrega</h1>
          <p className="text-sm text-black/60">
            Modelo de conteúdo. Ajuste prazos, regiões atendidas e regras de frete conforme sua operação.
          </p>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none pt-0">
          <ul>
            <li>Prazo estimado por região</li>
            <li>Condições de frete grátis</li>
            <li>Rastreamento e atualização de status</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}



