import { Suspense } from "react";
import { LoginClient } from "./login-client";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md text-sm text-black/60">Carregando...</div>}>
      <LoginClient />
    </Suspense>
  );
}


