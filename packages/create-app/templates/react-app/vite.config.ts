import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { envPrefix } from './config/common';
import { name, version } from './package.json';
import tsconfigPaths from 'vite-tsconfig-paths';
import envConfig from './lib/vite-env-config';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    envConfig({
      envPops: true,
      envPrefix,
      records: [
        ['APP_NAME', name],
        ['APP_VERSION', version]
      ]
    }),
    react(),
    tsconfigPaths()
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
