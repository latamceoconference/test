import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // !! 경고 !! 배포할 때 타입 에러가 있어도 무시하고 진행합니다.
    ignoreBuildErrors: true,
  },
  eslint: {
    // !! 경고 !! 배포할 때 문법 에러가 있어도 무시하고 진행합니다.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;