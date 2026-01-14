import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold text-black">Página não encontrada</h1>
          <p className="text-sm text-black/60">O endereço pode estar incorreto ou a página foi removida.</p>
        </CardHeader>
        <CardContent className="pt-0">
          <Link href="/">
            <Button>Voltar ao início</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}



