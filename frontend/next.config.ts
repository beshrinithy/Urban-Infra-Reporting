import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: "/api/ai/:path*",
        destination: "http://127.0.0.1:8000/:path*", // Proxy to AI Python Service
      },
      {
        source: "/api/:path*",
        destination: "http://localhost:5005/api/:path*", // Proxy to Express Backend (Localhost)
      },
    ];
  },
};

export default nextConfig;
