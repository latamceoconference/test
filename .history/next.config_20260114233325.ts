import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // 이건 여전히 잘 작동합니다! (타입 에러 무시)
    ignoreBuildErrors: true,
  },
  // ⚠️ eslint 설정은 지웠습니다. (이제 여기서 쓰면 에러남)
};

export default nextConfig;