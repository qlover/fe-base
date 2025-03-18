import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import alias from '@rollup/plugin-alias';
import tsappconfig from './tsconfig.json';
import { resolve } from 'path';
import { Env } from '@qlover/env-loader';
import { envPrefix } from './config/common';
import { name, version } from './package.json';
import { injectPkgConfig } from './lib/env-config/injectPkgConfig';

Env.searchEnv();

const tsAppPaths = tsappconfig.compilerOptions.paths || {};

// add version and name to env
injectPkgConfig(
  [
    ['APP_NAME', name],
    ['APP_VERSION', version]
  ],
  envPrefix
);

// convert tsconfig paths to vite alias
const entries = Object.entries(tsAppPaths).reduce((acc, [key, value]) => {
  acc[key.replace('/*', '')] = resolve(__dirname, value[0].replace('/*', ''));
  return acc;
}, {});

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    alias({
      entries
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
