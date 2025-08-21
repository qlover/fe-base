import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';
import { generateLocales } from './build/generateLocales';

const withNextIntl = createNextIntlPlugin();

// 在构建开始时生成本地化文件
generateLocales().catch((error) => {
  console.error('Failed to generate locales:', error);
});

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname // 明确指定根目录
  },
  env: {
    APP_ENV: process.env.APP_ENV
  }
};

export default withNextIntl(nextConfig);
