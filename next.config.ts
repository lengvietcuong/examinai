import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      { source: "/en", destination: "/" },
      { source: "/vi", destination: "/" },
    ];
  },
  images: {
    minimumCacheTTL: 31536000, // Cache optimized images for 1 year (static content)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uwcpvvjvppshywkphqum.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
