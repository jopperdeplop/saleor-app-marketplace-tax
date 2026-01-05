import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@saleor/app-sdk"],
};

export default nextConfig;
