import type { NextConfig } from "next";

/** 开发环境 `rewrites` 走 http-proxy，默认 30s 会断连（长耗时接口如 AI 诊断会 ECONNRESET） */
const PROXY_TIMEOUT_MS = 600_000; // 10 分钟

const nextConfig: NextConfig = {
  experimental: {
    proxyTimeout: PROXY_TIMEOUT_MS,
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:3000/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig;
