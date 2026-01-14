import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ReturnsPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold text-black">Trocas e Devoluções</h1>
          <p className="text-sm text-black/60">
            Modelo de conteúdo. Ajuste condições conforme o tipo de produto e exigências sanitárias.
          </p>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none pt-0">
          <p>
            Lentes podem ter restrições de devolução após abertura por motivos de higiene. Para reduzir dúvidas, exiba
            um resumo da política na página do produto e no checkout.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}



