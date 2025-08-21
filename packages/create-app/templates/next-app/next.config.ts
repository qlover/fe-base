import type { NextConfig } from 'next';
import { i18nConfig } from './config/i18n';
import { generateLocales } from './build/generateLocales';

// 在构建开始时生成本地化文件
generateLocales().catch(error => {
  console.error('Failed to generate locales:', error);
});

const nextConfig: NextConfig = {
  env: {
    APP_ENV: process.env.APP_ENV
  },
  i18n: {
    defaultLocale: i18nConfig.fallbackLng,
    locales: i18nConfig.supportedLngs,
    localeDetection: i18nConfig.localeDetection
  }
};

export default nextConfig;
