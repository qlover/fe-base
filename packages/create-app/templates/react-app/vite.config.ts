import { defineConfig } from 'vite';
import alias from '@rollup/plugin-alias';
// import react from '@vitejs/plugin-react-swc';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import tsappconfig from './tsconfig.app.json';
import { Env } from '@qlover/env-loader';

Env.searchEnv();

const tsAppPaths = tsappconfig.compilerOptions.paths || {};

const entries = Object.entries(tsAppPaths).map(([key, value]) => {
  return {
    find: key.replace('/*', ''),
    replacement: path.resolve(__dirname, value[0].replace('/*', ''))
  };
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    alias({
      entries
    })
  ],
  publicDir: 'public',
  server: {
    port: Number(process.env.VITE_SERVER_PORT || 3100)
  }
});
