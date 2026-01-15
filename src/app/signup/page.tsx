import { Suspense } from "react";
import { SignupClient } from "./signup-client";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md text-sm text-black/60">Carregando...</div>}>
      <SignupClient />
    </Suspense>
  );
}


