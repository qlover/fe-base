/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import {
  envPrefix,
  overrideAntdThemeMode,
  routerPrefix
} from './config/common';
import { name, version } from './package.json';
import tsconfigPaths from 'vite-tsconfig-paths';
import envConfig from '@qlover/corekit-bridge/build/vite-env-config';
import ts2Locales from '@brain-toolkit/ts2locales/vite';
import i18nConfig from './config/i18n';
import tailwindcss from '@tailwindcss/vite';
import viteDeprecatedAntd from '@brain-toolkit/antd-theme-override/vite';
import vitePluginImp from 'vite-plugin-imp';
import { generateTs2LocalesOptions } from './makes/generateTs2LocalesOptions';

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'antd-core': [
            'antd/es/config-provider',
            'antd/es/theme',
            'antd/es/locale'
          ],
          'antd-basic': [
            'antd/es/button',
            'antd/es/input',
            'antd/es/form',
            'antd/es/select'
          ],
          'antd-advanced': [
            'antd/es/progress',
            'antd/es/card',
            'antd/es/space',
            'antd/es/tag',
            'antd/es/table'
          ],
          utils: ['lodash/random', 'lodash/merge', 'lodash/get', 'lodash/set'],
          i18n: ['i18next', 'react-i18next']
        }
      }
    },
    chunkSizeWarningLimit: 600,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: [
          'console.log',
          'console.info',
          'console.debug',
          'console.time',
          'console.timeEnd'
        ],
        passes: 2,
        toplevel: true
      },
      format: {
        comments: false
      },
      mangle: {
        safari10: true
      }
    }
  },
  plugins: [
    tailwindcss(),
    vitePluginImp({
      libList: [
        {
          libName: 'antd',
          style: (name) => `antd/es/${name}/style/index`,
          libDirectory: 'es'
        }
      ]
    }),
    envConfig({
      envPops: true,
      envPrefix,
      records: [
        ['APP_NAME', name],
        ['APP_VERSION', version]
      ]
    }),
    react(),
    tsconfigPaths(),
    ts2Locales({
      locales: i18nConfig.supportedLngs as unknown as string[],
      options: generateTs2LocalesOptions()
    }),
    viteDeprecatedAntd({
      mode: overrideAntdThemeMode,
      overriedCssFilePath: './src/styles/css/antd-themes/no-context.css',
      targetPath: './src/base/types/deprecated-antd.d.ts'
    })
  ] as any[],
  base: routerPrefix,
  envPrefix: envPrefix,
  publicDir: 'public',
  server: {
    port: Number(process.env.VITE_SERVER_PORT || 3200)
  },
  test: {
    watch: false,
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./__tests__/setup/index.ts']
  }
});
