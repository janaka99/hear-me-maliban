import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@prisma/client"],
  },
  serverActions: {
    bodySizeLimit: "10mb", // increase to 10 MB (or any size you need)
  },
};

export default nextConfig;
