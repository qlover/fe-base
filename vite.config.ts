import { defineConfig } from 'vitest/config';
import viteMockPackage from './make/vite-mock-package';

export default defineConfig({
  // plugins: [
  //   viteMockPackage({
  //     onlyPackages: ['scripts-context', 'env-loader', 'fe-corekit']
  //   })
  // ],
  test: {
    environment: 'node',
    globals: true,
    watch: false,
    include: ['packages/**/__tests__/**/*.test.{ts,tsx}'],
    exclude: [
      './packages/create-app/templates/**',
      // workspace:* case link to local package, has __tests__ folder
      'packages/**/node_modules/**'
    ],
    alias:{
      '@qlover/env-loader': 'D:\\qrj\\workspace\\fe-base\\packages\\env-loader\\__mocks__',
      '@qlover/fe-corekit': 'D:\\qrj\\workspace\\fe-base\\packages\\fe-corekit\\__mocks__',
      '@qlover/scripts-context': 'D:\\qrj\\workspace\\fe-base\\packages\\scripts-context\\__mocks__'
    }
  }
});
