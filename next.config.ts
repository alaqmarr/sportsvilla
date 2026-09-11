import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma"],
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
  allowedDevOrigins: ["192.168.31.172"],
};

export default nextConfig;

// Trigger restart
