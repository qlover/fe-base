import js from '@eslint/js';
import globals from 'globals';
import vitest from 'eslint-plugin-vitest';
import * as eslintChain from '@qlover/fe-standard/eslint/index.js';
import * as feDev from '@qlover/eslint-plugin-fe-dev';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from './.prettierrc.js';

const { createCommon, chainEnv } = eslintChain;
const allGlobals = {
  ...globals.browser,
  ...globals.vitest,
  ...vitest.environments.env.globals
};

function createVitestConfig() {
  const config = chainEnv({
    allGlobals,
    files: [
      'packages/**/__tests__/**/*.test.ts',
      'packages/**/__tests__/**/*.test.tsx'
    ],
    plugins: {
      vitest
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...vitest.environments.env.globals
      }
    }
  });
  return config;
}

const commonConfig = createCommon();

/**
 * @type {import('eslint').Linter.Config[]}
 */
export default tseslint.config([
  {
    ignores: ['**/dist/**', '**/build/**', '**/node_modules/**']
  },

  {
    files: ['**/*.{js,jsx}'],
    extends: [js.configs.recommended, commonConfig],
    plugins: {
      prettier: prettier
    },
    rules: {
      ...js.configs.recommended.rules,
      'prettier/prettier': ['error', prettierConfig],
      'spaced-comment': 'error'
    }
  },

  {
    files: ['**/*.{ts,tsx}'],
    extends: [...tseslint.configs.recommended],

    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'fe-dev': feDev
    },
    rules: {
      'fe-dev/ts-class-method-return': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' }
      ],
      '@typescript-eslint/ban-ts-comment': 'off',
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ]
    }
  },

  createVitestConfig()
]);
