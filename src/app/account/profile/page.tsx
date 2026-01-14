"use client";

import * as React from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Profile = {
  full_name: string | null;
  cpf: string | null;
  phone: string | null;
  cep: string | null;
  address_line1: string | null;
  city: string | null;
  state: string | null;
};

export default function AccountProfilePage() {
  const { user } = useAuth();

  const [profile, setProfile] = React.useState<Profile>({
    full_name: "",
    cpf: "",
    phone: "",
    cep: "",
    address_line1: "",
    city: "",
    state: ""
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Supabase não configurado (.env.local).");
      return;
    }

    supabase
      .from("profiles")
      .select("full_name,cpf,phone,cep,address_line1,city,state")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
          return;
        }
        if (data) setProfile(data as any);
      });
  }, [user]);

  const save = async () => {
    setError(null);
    setDone(false);
    if (!user) return;
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Supabase não configurado (.env.local).");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        cpf: profile.cpf,
        phone: profile.phone,
        cep: profile.cep,
        address_line1: profile.address_line1,
        city: profile.city,
        state: profile.state,
        updated_at: new Date().toISOString()
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold text-black">Perfil e endereço</h1>
          <p className="text-sm text-black/60">Seus dados aqui preenchem o checkout automaticamente.</p>
        </CardHeader>
        <CardContent className="grid gap-3 pt-0">
          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-1">
              <Label>Nome completo</Label>
              <Input
                value={profile.full_name ?? ""}
                onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
              />
            </div>
            <div className="grid gap-1">
              <Label>CPF</Label>
              <Input value={profile.cpf ?? ""} onChange={(e) => setProfile((p) => ({ ...p, cpf: e.target.value }))} />
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-1">
              <Label>Telefone</Label>
              <Input
                value={profile.phone ?? ""}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <div className="grid gap-1">
              <Label>CEP</Label>
              <Input value={profile.cep ?? ""} onChange={(e) => setProfile((p) => ({ ...p, cep: e.target.value }))} />
            </div>
          </div>
          <div className="grid gap-1">
            <Label>Endereço</Label>
            <Input
              value={profile.address_line1 ?? ""}
              onChange={(e) => setProfile((p) => ({ ...p, address_line1: e.target.value }))}
            />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-1">
              <Label>Cidade</Label>
              <Input value={profile.city ?? ""} onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))} />
            </div>
            <div className="grid gap-1">
              <Label>Estado</Label>
              <Input
                value={profile.state ?? ""}
                onChange={(e) => setProfile((p) => ({ ...p, state: e.target.value }))}
                placeholder="SP"
              />
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-500/20 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}
          {done ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Salvo com sucesso.
            </div>
          ) : null}

          <Button onClick={save} disabled={saving || !user}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


