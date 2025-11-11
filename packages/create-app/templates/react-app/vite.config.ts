import viteDeprecatedAntd from '@brain-toolkit/antd-theme-override/vite';
import ts2Locales from '@brain-toolkit/ts2locales/vite';
import envConfig from '@qlover/corekit-bridge/build/vite-env-config';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { visualizer } from 'rollup-plugin-visualizer';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';
import {
  envPrefix,
  overrideAntdThemeMode,
  routerPrefix
} from './config/common';
import { i18nConfig } from './config/i18n/i18nConfig';
import { generateTs2LocalesOptions } from './makes/generateTs2LocalesOptions';
import { name, version } from './package.json';

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
    envConfig({
      envPops: true,
      envPrefix,
      records: [
        ['APP_NAME', name],
        ['APP_VERSION', version]
      ]
    }),
    react({
      tsDecorators: true
    }),
    tsconfigPaths(),
    ts2Locales({
      locales: i18nConfig.supportedLngs as unknown as string[],
      options: generateTs2LocalesOptions()
    }),
    viteDeprecatedAntd({
      mode: overrideAntdThemeMode,
      overriedCssFilePath: './src/styles/css/antd-themes/no-context.css',
      targetPath: './src/base/types/deprecated-antd.d.ts'
    }),
    // Bundle size analysis tool
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap' // 'sunburst' | 'treemap' | 'network'
    })
  ] as any[],
  base: routerPrefix,
  envPrefix: envPrefix,
  publicDir: 'public',
  server: {
    port: Number(process.env.VITE_SERVER_PORT || 3200),
    fs: {
      deny: ['**/playwright-report/**']
    }
  },
  optimizeDeps: {
    // exclude: ['playwright-report'],
    esbuildOptions: {
      tsconfigRaw: {
        compilerOptions: {
          /**
           * Solve the problem, tsconfig.json has already configured experimentalDecorators: true,
           * esbuild uses a separate configuration when compiling?
           *
           * X [ERROR] Parameter decorators only work when experimental decorators are enabled
           * You can enable experimental decorators by adding "experimentalDecorators": true to your "tsconfig.json" file.
           */
          experimentalDecorators: true
        }
      }
    },
    /**
     * If current project has other html files, it will automatically scan all html files,
     * like some automatically generated html files, like: playwright-report/index.html,
     * so we need to exclude them.
     */
    entries: ['index.html']
  },
  test: {
    watch: false,
    environment: 'jsdom',
    globals: true,
    include: ['__tests__/**/*.test.ts', '__tests__/**/*.test.tsx'],
    exclude: ['__tests__/**/*.e2e.ts', '__tests__/**/*.e2e.tsx'],
    setupFiles: ['./__tests__/setup/index.ts']
  }
});
