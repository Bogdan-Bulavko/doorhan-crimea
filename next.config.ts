import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  
  // КРИТИЧНО: Настройки для GitHub Pages в подпапке
  basePath: '/doorhan-crimea',
  assetPrefix: '/doorhan-crimea/',
  
  // Настройки для GitHub Pages
  images: {
    unoptimized: true,
  },

  // Убираем функции, которые не работают в статическом режиме
  async redirects() {
    return [];
  },
  async headers() {
    return [];
  },
};

export default nextConfig;
