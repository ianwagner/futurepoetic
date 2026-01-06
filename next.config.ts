import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  assetPrefix: isProd ? "/" : undefined,
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
