import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // 이건 여전히 잘 작동합니다! (타입 에러 무시)
    ignoreBuildErrors: true,
  },
  turbopack: {
    // Turbopack root를 명시해서 workspace root 경고를 줄입니다.
    // (Windows/OneDrive 환경에서 상위 lockfile을 root로 잡는 이슈 방지)
    root: __dirname,
  },
};

export default nextConfig;