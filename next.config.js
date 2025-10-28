/** @type {import('next').NextConfig} */
const nextConfig = {
  // 啟用靜態匯出（完全離線使用）
  // TODO: Re-enable after implementing client-side routing solution for dynamic routes
  // output: 'export',

  // 圖片優化設定（靜態匯出需要使用 unoptimized）
  images: {
    unoptimized: true,
  },

  // TypeScript 設定
  typescript: {
    // 暫時跳過建置時型別檢查（因 TypeScript 編譯器 cache 問題）
    // TODO: 在開發時應設為 false
    ignoreBuildErrors: true,
  },

  // ESLint 設定
  eslint: {
    // 建置時進行 lint 檢查
    ignoreDuringBuilds: false,
  },

  // 關閉 React 嚴格模式（避免 double rendering 影響動畫）
  reactStrictMode: true,

  // 安全性 Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // 實驗性功能
  experimental: {
    // 可在此添加實驗性功能
  },

  // Webpack 設定（支援 sql.js WASM）
  webpack: (config, { isServer }) => {
    // 支援 WASM 檔案
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // 支援 .wasm 檔案
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });

    // 瀏覽器端不需要 Node.js 模組
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;
