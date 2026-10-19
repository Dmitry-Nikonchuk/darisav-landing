import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Build a minimal Node.js bundle for the ISPmanager deployment only.
  // Vercel keeps using its normal Next.js build output.
  ...(process.env.BUILD_STANDALONE === "true" ? { output: "standalone" as const } : {}),
};

export default nextConfig;
