import eslintJest from './packages/fe-standard/config/eslint.jest.js';
import eslintBaseTs from './packages/fe-standard/config/eslint.base.ts.js';
import eslintBaseJs from './packages/fe-standard/config/eslint.base.js';

/**
 * @type {import('eslint').Linter.Config[]}
 */
export default [
  {
    ignores: ['**/node_modules/**/*', '**/dist/**/*', '**/build/**/*']
  },
  {
    ...eslintBaseJs,
    files: ['packages/**/*.js', 'packages/**/*.cjs', 'packages/**/*.mjs']
  },
  {
    ...eslintBaseTs,
    files: ['packages/**/*.ts']
  },
  {
    ...eslintJest,
    files: ['**/*.test.js', '**/*.spec.js']
  }
];
