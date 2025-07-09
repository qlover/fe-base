import { defineConfig } from 'vitest/config';
import { parsePackagesMap } from './make/vite-mock-package/index';

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
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.changelog/**',
      '**/.github/**',
      '**/.husky/**',
      '**/.vscode/**',
      '**/.nx/**',
      '**/packages/create-app/templates/**'
    ],
    alias: {
      ...parsePackagesMap({
        onlyPackages: ['scripts-context', 'env-loader', 'fe-corekit', 'logger']
      })
    }
  }
});
