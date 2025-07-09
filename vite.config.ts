import { defineConfig } from 'vitest/config';
import viteMockPackage, { parsePackagesMap } from './make/vite-mock-package';

export default defineConfig({
  // plugins: [
  // FIXME: not override alias?
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
      '.changelog',
      '.github',
      '.husky',
      '.vscode',
      '.nx',
      'node_modules',
      'dist',
      'build',
      'packages/create-app/templates',
      'packages/**/node_modules/**'
    ],
    alias: {
      ...parsePackagesMap({
        onlyPackages: ['scripts-context', 'env-loader', 'fe-corekit', 'logger']
      })
    }
  }
});
