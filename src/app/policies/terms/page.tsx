import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold text-black">Termos de Uso</h1>
          <p className="text-sm text-black/60">
            Modelo de conteúdo. Antes de publicar, revise com jurídico e adapte à sua operação.
          </p>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none pt-0">
          <p>
            Este texto é apenas um exemplo. No Brasil, considere o CDC e outras normas aplicáveis ao e-commerce.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}



