"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";

function normalizePhone(raw: string) {
  return raw.replace(/\D/g, "");
}

export function FloatingWhatsApp() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE;
  if (!phone) return null;

  const to = normalizePhone(phone);
  if (!to) return null;

  const href = `https://wa.me/${to}`;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 hover:shadow-emerald-600/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        aria-label="Falar no WhatsApp"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">WhatsApp</span>
      </Link>
    </div>
  );
}


