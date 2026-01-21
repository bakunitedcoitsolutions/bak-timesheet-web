import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  // Exclude server-only packages from client bundle
  // serverExternalPackages: ["pg", "@prisma/client", "@prisma/adapter-pg"],
  // experimental: {
  //   serverComponentsExternalPackages: [
  //     "pg",
  //     "@prisma/client",
  //     "@prisma/adapter-pg",
  //   ],
  // },
};

export default nextConfig;
