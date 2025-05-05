import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ensure these Node.js modules are not included in client-side bundles
      config.resolve.fallback = {
        ...config.resolve.fallback,
        child_process: false,
        fs: false,
        os: false,
        'gcp-metadata': false,
        net: false,
        tls: false,
        dns: false
      };
    }
    return config;
  }
};

export default nextConfig;
