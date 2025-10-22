import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  trailingSlash: true,

  images: {
    unoptimized: true,
  },

  async redirects() {
    return [];
  },
  async headers() {
    return [];
  },
};

export default nextConfig;
