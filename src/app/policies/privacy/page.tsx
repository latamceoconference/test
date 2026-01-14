import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold text-black">Política de Privacidade</h1>
          <p className="text-sm text-black/60">
            Modelo de conteúdo. Antes de publicar, revise com jurídico e segurança.
          </p>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none pt-0">
          <p>
            No Brasil, a conformidade com a LGPD é essencial. Informe claramente quais dados são coletados (CPF,
            endereço), finalidade, tempo de retenção e compartilhamento com provedores de pagamento (quando aplicável).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}



