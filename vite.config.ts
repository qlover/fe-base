import { defineConfig } from 'vitest/config';
import { parsePackagesMap } from './tools/vite-mock-package/index';

export default defineConfig(() => {
  // Use function form to defer execution, avoiding blocking VSCode TypeScript server
  return {
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
          onlyPackages: [
            'scripts-context',
            'env-loader',
            'fe-corekit',
            'logger'
          ]
        })
      }
    }
  };
});
