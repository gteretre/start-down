import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co"
      }
    ]
  },
  experimental: {
    ppr: "incremental"
  },
  devIndicators: {
    // appIsrStatus: true,
    // buildActivity: true,
    // buildActivityPosition: "bottom-right"
  }
};

export default nextConfig;
