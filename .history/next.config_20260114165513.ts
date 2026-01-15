import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Evita aviso do Turbopack ao inferir workspace root quando há múltiplos lockfiles no computador
    root: __dirname
  }
};

export default nextConfig;
