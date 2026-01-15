"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupClient() {
  const router = useRouter();
  const search = useSearchParams();
  const returnTo = search.get("returnTo") ?? "/account";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const submit = async () => {
    setError(null);
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError(
        "Supabase não configurado. Verifique lensstore/.env.local (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY) e reinicie o servidor (npm run dev)."
      );
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  };

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold text-black">Criar conta</h1>
          <p className="text-sm text-black/60">Salve seu endereço e recompre com poucos cliques.</p>
        </CardHeader>
        <CardContent className="grid gap-3 pt-0">
          <div className="grid gap-1">
            <Label>E-mail</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" />
          </div>
          <div className="grid gap-1">
            <Label>Senha</Label>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Mínimo recomendado: 8+ caracteres"
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-500/20 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}

          <Button onClick={submit} disabled={loading}>
            {loading ? "Criando..." : "Criar conta"}
          </Button>

          <div className="text-sm text-black/60">
            Já tem conta?{" "}
            <Link href={`/login?returnTo=${encodeURIComponent(returnTo)}`} className="hover:text-black">
              Entrar
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


