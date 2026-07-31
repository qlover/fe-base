import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

const packageAliases = {
  '@qlover/code2markdown': resolve(__dirname, './packages/code2markdown/src'),
  // Source lives under src/core; prefix alias also covers /ioc, /bootstrap, etc.
  '@qlover/corekit-bridge/build/tw-root10px': resolve(
    __dirname,
    './packages/corekit-bridge/src/build/tw-root10px'
  ),
  '@qlover/corekit-bridge/build/vite-env-config': resolve(
    __dirname,
    './packages/corekit-bridge/src/build/vite-env-config'
  ),
  '@qlover/corekit-bridge/build/vite-ts-to-locales': resolve(
    __dirname,
    './packages/corekit-bridge/src/build/vite-ts-to-locales'
  ),
  '@qlover/corekit-bridge': resolve(
    __dirname,
    './packages/corekit-bridge/src/core'
  ),
  '@qlover/corekit-node': resolve(__dirname, './packages/corekit-node/src'),
  '@qlover/create-app': resolve(__dirname, './packages/create-app/src'),
  '@qlover/env-loader': resolve(__dirname, './packages/env-loader/src'),
  '@qlover/eslint-plugin': resolve(__dirname, './packages/eslint-plugin/src'),
  '@qlover/fe-corekit': resolve(__dirname, './packages/fe-corekit/src'),
  '@qlover/fe-release': resolve(__dirname, './packages/fe-release/src'),
  '@qlover/fe-scripts': resolve(__dirname, './packages/fe-scripts/src'),
  '@qlover/fe-standard': resolve(__dirname, './packages/fe-standard'),
  '@qlover/logger': resolve(__dirname, './packages/logger/src'),
  '@qlover/scripts-context': resolve(
    __dirname,
    './packages/scripts-context/src'
  ),
  '@qlover/tailwind-theme': resolve(__dirname, './packages/tailwind-theme/src'),
  '@qlover/tailwind-theme/generater': resolve(
    __dirname,
    './packages/tailwind-theme/src/generater.ts'
  )
};

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'packages',
          environment: 'node',
          globals: true,
          include: ['packages/**/__tests__/**/*.test.{ts,tsx}'],
          exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/packages/create-app/templates/**',
            // React Testing Library hooks/components need jsdom (next-kit project)
            'packages/next-kit/**'
          ]
        },
        resolve: {
          alias: packageAliases
        }
      },
      {
        test: {
          name: 'next-kit',
          environment: 'jsdom',
          globals: true,
          include: ['packages/next-kit/__tests__/**/*.test.{ts,tsx}']
        },
        resolve: {
          alias: packageAliases
        }
      },
      './examples/*'
    ]
  }
});
