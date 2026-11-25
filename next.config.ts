import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  experimental: {
    // Vercel restores .next/cache between builds. A stale Turbopack build cache served an old
    // compiled globals.css (without the dashboard tokens) on the client-demo preview, so every
    // build compiles from source. Cost: slightly slower builds.
    turbopackFileSystemCacheForBuild: false,
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
