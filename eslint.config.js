import js from '@eslint/js';
import globals from 'globals';
import vitest from 'eslint-plugin-vitest';
import * as eslintChain from '@qlover/fe-standard/eslint/index.js';
import qloverEslint from '@qlover/eslint-plugin';
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

function createFeCorekitConfig() {
  const feCorekitCommon = chainEnv({
    allGlobals,
    files: ['packages/fe-corekit/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node
        // console: null
      }
    }
  });
  const feCorekitServer = chainEnv({
    allGlobals,
    files: ['packages/corekit-node/**/*.ts'],
    languageOptions: {
      globals: globals.node
    }
  });

  return [feCorekitCommon, feCorekitServer];
}

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
    files: ['packages/**/*.{js,jsx,ts,tsx}', 'make/**/*.{js,jsx,ts,tsx}'],
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
    files: ['packages/**/*.{ts,tsx}', 'make/**/*.{ts,tsx}'],
    extends: [...tseslint.configs.recommended],
    plugins: {
      '@qlover-eslint': qloverEslint
    },
    rules: {
      '@qlover-eslint/ts-class-method-return': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/ban-ts-comment': 'off'
    }
  },

  // fe-corekit
  ...createFeCorekitConfig(),

  // react tsx
  {
    files: ['packages/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ]
    }
  },

  createVitestConfig()
]);
