import { resolve } from 'path';
import ts2Locales from '@brain-toolkit/ts2locales/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { viteMockServe } from 'vite-plugin-mock';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';
import { i18nConfig, i18nLoadPath } from './config/i18n';
import { routerPrefix } from './config/seed.config';
import { name, version } from './package.json';
import { getAllI18nIdentifierFiles } from './tools/i18nIdentifierGenerator';
import type { Plugin } from 'vite';

const relativePath = (path: string) => resolve(__dirname, path);

// https://vite.dev/config/
export default defineConfig({
  base: routerPrefix,
  define: {
    'import.meta.env.VITE_APP_NAME': JSON.stringify(name),
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(version)
  },
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths({
      projects: ['./tsconfig.test.json']
    }),
    process.env.ANALYZE === 'true' &&
      visualizer({
        filename: 'dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap'
      }),
    ts2Locales({
      locales: i18nConfig.supportedLngs as unknown as string[],
      // target: relativePath('./public/locales/{{lng}}/{{ns}}.json'),
      target: relativePath('./public/' + i18nLoadPath),
      // 注释后只保留 common
      // resolveNs: (key) => key.split(':')[0],
      // 不保留命名空间
      // resolveKeyInFile: (key, ns) => key.slice(ns.length + 1),
      options: getAllI18nIdentifierFiles(
        relativePath('./config/i18n-identifier')
      )
    }) as Plugin,
    process.env.NODE_ENV === 'development' &&
      viteMockServe({
        mockPath: relativePath('./config/mock'), // 指定 mock 文件目录
        enable: true,
        // prodEnabled: false, // 生产环境禁用
        logger: true // 控制台显示请求日志
      })
  ],
  test: {
    watch: false,
    environment: 'jsdom',
    globals: true,
    include: ['__tests__/**/*.test.{ts,tsx}'],
    setupFiles: ['./__tests__/index.ts'],
    reporters: ['default', 'hanging-process']
  }
});
