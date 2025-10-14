import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Настройки для GitHub Pages
  images: {
    unoptimized: true, // Обязательно для GitHub Pages
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'crimea-doorhan.ru',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Оптимизация производительности
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  // Сжатие
  compress: true,

  // Безопасность
  poweredByHeader: false,

  // Переадресации для SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Заголовки для безопасности и производительности
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
