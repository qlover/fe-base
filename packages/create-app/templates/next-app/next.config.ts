import createNextIntlPlugin from 'next-intl/plugin';
import { generateLocales } from './make/generateLocales';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// 在构建开始时生成本地化文件
generateLocales().catch((error) => {
  console.error('Failed to generate locales:', error);
});

const nextConfig: NextConfig = {
  // reactStrictMode: false,
  turbopack: {
    root: __dirname // 明确指定根目录
  },
  transpilePackages: [
    '@qlover/corekit-bridge',
    '@qlover/fe-corekit'
  ],
  env: {
    APP_ENV: process.env.APP_ENV
  }
};

export default withNextIntl(nextConfig);
