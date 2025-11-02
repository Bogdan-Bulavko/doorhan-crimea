import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Используем статический экспорт только для GitHub Pages; иначе обычный серверный режим (совместим с `npm start`)
  output: process.env.DEPLOY_TARGET === 'gh-pages' ? 'export' : undefined,
  trailingSlash: true,
  // Включаем basePath/assetPrefix только при деплое на GitHub Pages
  ...(process.env.DEPLOY_TARGET === 'gh-pages'
    ? { basePath: '/doorhan-crimea', assetPrefix: '/doorhan-crimea/' }
    : {}),

  // Настройки для GitHub Pages
  images: {
    unoptimized: true,
  },

  // Включаем строгую проверку ESLint и TypeScript во время билда
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },

  // Уточняем корень трейсинга, чтобы убрать предупреждение о lockfile
  outputFileTracingRoot: process.cwd(),

  // Убираем функции, которые не работают в статическом режиме
  async redirects() {
    return [];
  },
  async headers() {
    return [];
  },

  // Настройки для работы с поддоменами
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
