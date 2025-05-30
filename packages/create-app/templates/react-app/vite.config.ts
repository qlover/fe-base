import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { envPrefix } from './config/common';
import { name, version } from './package.json';
import tsconfigPaths from 'vite-tsconfig-paths';
import envConfig from '@qlover/corekit-bridge/vite-env-config/index';
import ts2Locales from '@qlover/corekit-bridge/vite-ts-to-locales/index';
import i18nConfig from './config/i18n';
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
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
    react(),
    tsconfigPaths(),
    ts2Locales({
      locales: i18nConfig.supportedLngs as unknown as string[],
      options: [
        {
          source: './config/ErrorIdentifier.ts',
          target: './public/locales/{{lng}}/common.json'
        }
      ]
    })
  ],
  envPrefix: envPrefix,
  publicDir: 'public',
  server: {
    port: Number(process.env.VITE_SERVER_PORT || 3200)
  },
  mode: process.env.NODE_ENV,
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts']
  }
});
