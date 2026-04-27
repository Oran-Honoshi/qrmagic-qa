import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },

  // Prevent SSR issues with browser-only libraries
  webpack: (config, { isServer }) => {
    if (isServer) {
      // qr-code-styling uses browser APIs — exclude from server bundle
      config.externals = [...(config.externals || []), "qr-code-styling"];
    }
    return config;
  },
};

export default nextConfig;