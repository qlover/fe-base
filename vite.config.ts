import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig(() => {
  // Use function form to defer execution, avoiding blocking VSCode TypeScript server
  return {
    resolve: {
      alias: {
        '@qlover/code2markdown': resolve(
          __dirname,
          './packages/code2markdown/src'
        ),
        '@qlover/corekit-bridge': resolve(
          __dirname,
          './packages/corekit-bridge/src'
        ),
        '@qlover/corekit-node': resolve(
          __dirname,
          './packages/corekit-node/src'
        ),
        '@qlover/create-app': resolve(__dirname, './packages/create-app/src'),
        '@qlover/env-loader': resolve(__dirname, './packages/env-loader/src'),
        '@qlover/eslint-plugin': resolve(
          __dirname,
          './packages/eslint-plugin/src'
        ),
        '@qlover/fe-corekit': resolve(__dirname, './packages/fe-corekit/src'),
        '@qlover/fe-release': resolve(__dirname, './packages/fe-release/src'),
        '@qlover/fe-scripts': resolve(__dirname, './packages/fe-scripts/src'),
        '@qlover/fe-standard': resolve(__dirname, './packages/fe-standard'),
        '@qlover/logger': resolve(__dirname, './packages/logger/src'),
        '@qlover/scripts-context': resolve(
          __dirname,
          './packages/scripts-context/src'
        )
      }
    },
    test: {
      environment: 'node',
      globals: true,
      watch: false,
      include: ['packages/**/__tests__/**/*.test.{ts,tsx}'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.changelog/**',
        '**/.github/**',
        '**/.husky/**',
        '**/.vscode/**',
        '**/.nx/**',
        '**/packages/create-app/templates/**'
      ]
    }
  };
});
