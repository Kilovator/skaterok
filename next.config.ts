import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable Webpack disk caching to prevent ENOENT/file lock errors on Windows with non-ASCII paths
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
