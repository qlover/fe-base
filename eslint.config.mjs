import typescriptEslint from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-plugin-prettier';
import tsParser from '@typescript-eslint/parser';

/**
 * @type {import('eslint').Linter.Config[]}
 */
export default [
  {
    ignores: ['**/node_modules/**/*', '**/dist/**/*', '**/build/**/*'],
  },
  // js
  {
    languageOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
      globals: {
        browser: true,
        node: true,
      },
    },
    plugins: {
      prettier: prettier,
    },
    rules: {
      'prettier/prettier': ['error'],
      quotes: ['error', 'double'],
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off',
    },
    files: ['./packages/**/*.js'],
  },
  // typescript
  {
    languageOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
      globals: {
        browser: true,
        node: true,
      },
      parser: tsParser,
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      prettier,
    },
    rules: {
      'prettier/prettier': ['error'],
      quotes: ['error', 'single'],
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
    },
    files: ['./packages/**/*.ts'],
  },
  // jest
  // eslintJest,
];
