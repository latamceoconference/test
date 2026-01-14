"use client";

import * as React from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AccountSecurityPage() {
  const { user } = useAuth();
  const [password, setPassword] = React.useState("");
  const [password2, setPassword2] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  const changePassword = async () => {
    setError(null);
    setDone(false);
    if (!user) return;
    if (password.length < 8) {
      setError("Use uma senha com pelo menos 8 caracteres.");
      return;
    }
    if (password !== password2) {
      setError("As senhas não coincidem.");
      return;
    }
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Supabase não configurado (.env.local).");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setPassword("");
    setPassword2("");
    setDone(true);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold text-black">Segurança</h1>
          <p className="text-sm text-black/60">Atualize sua senha para manter sua conta protegida.</p>
        </CardHeader>
        <CardContent className="grid gap-3 pt-0">
          <div className="grid gap-1">
            <Label>Nova senha</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" />
          </div>
          <div className="grid gap-1">
            <Label>Confirmar nova senha</Label>
            <Input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="********"
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-500/20 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}
          {done ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Senha atualizada com sucesso.
            </div>
          ) : null}

          <Button onClick={changePassword} disabled={loading || !user}>
            {loading ? "Atualizando..." : "Atualizar senha"}
          </Button>

          <p className="text-xs text-black/50">
            Se aparecer erro pedindo reautenticação, saia e entre novamente, e tente de novo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


