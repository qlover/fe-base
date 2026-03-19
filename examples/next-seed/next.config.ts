import createNextIntlPlugin from 'next-intl/plugin';
import { generateApiRoutes } from './tools/generateApiRoutes';
import { generateLocales } from './tools/generateLocales';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

generateApiRoutes(__dirname, { outFile: './shared/config/apiRoutes.ts' }).catch(
  (error) => {
    console.error('Failed to generate API routes:', error);
  }
);

// 在构建开始时生成本地化文件（传入当前 config 所在目录作为项目根）
generateLocales(__dirname, {
  identifierDir: './shared/config/i18n-identifier'
}).catch((error) => {
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
