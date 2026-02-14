import createNextIntlPlugin from 'next-intl/plugin';
import { generateLocales } from './tools/generateLocales';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// 在构建开始时生成本地化文件
generateLocales().catch((error) => {
  console.error('Failed to generate locales:', error);
});

const nextConfig: NextConfig = {
  // reactStrictMode: false,
  // pages 路由需要
  transpilePackages: ['@qlover/fe-corekit', '@qlover/corekit-bridge'],
  env: {
    APP_ENV: process.env.APP_ENV
  }
};

export default withNextIntl(nextConfig);
