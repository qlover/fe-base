import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

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
            '**/packages/create-app/templates/**'
          ]
        },
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
            '@qlover/create-app': resolve(
              __dirname,
              './packages/create-app/src'
            ),
            '@qlover/env-loader': resolve(
              __dirname,
              './packages/env-loader/src'
            ),
            '@qlover/eslint-plugin': resolve(
              __dirname,
              './packages/eslint-plugin/src'
            ),
            '@qlover/fe-corekit': resolve(
              __dirname,
              './packages/fe-corekit/src'
            ),
            '@qlover/fe-release': resolve(
              __dirname,
              './packages/fe-release/src'
            ),
            '@qlover/fe-scripts': resolve(
              __dirname,
              './packages/fe-scripts/src'
            ),
            '@qlover/fe-standard': resolve(__dirname, './packages/fe-standard'),
            '@qlover/logger': resolve(__dirname, './packages/logger/src'),
            '@qlover/scripts-context': resolve(
              __dirname,
              './packages/scripts-context/src'
            )
          }
        }
      },
      './examples/*'
    ]
  }
});
