import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', '@clerk/nextjs'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  }
};
export default nextConfig;
