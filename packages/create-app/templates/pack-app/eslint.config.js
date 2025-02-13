import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettierConfig from './.prettierrc.js';
import prettier from 'eslint-plugin-prettier';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import * as feDev from '@qlover/eslint-plugin-fe-dev';
import vitestPlugin from 'eslint-plugin-vitest';

const allowedGlobals = {
  ...globals.browser,
  ...globals.node,
  ...globals.jest
};

export default [
  {
    ignores: ['dist', 'node_modules']
  },
  {
    files: ['packages/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
        project: './tsconfig.json'
      }
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier,
      '@typescript-eslint': tseslint,
      'fe-dev': feDev
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'react/prefer-stateless-function': 'error',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      'prettier/prettier': ['error', prettierConfig],
      '@typescript-eslint/ban-ts-comment': [
        'off',
        {
          'ts-expect-error': {
            descriptionFormat: '^.*$'
          }
        }
      ],
      'react-hooks/exhaustive-deps': 'off',
      'fe-dev/ts-class-method-return': 'error'
    }
  },
  {
    files: ['packages/**/__tests__/**/*.test.{ts,tsx}'],
    plugins: {
      vitest: vitestPlugin
    },
    languageOptions: {
      parser: tsparser,
      globals: {
        ...allowedGlobals,
        ...vitestPlugin.environments.env.globals
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: './tsconfig.json'
      }
    },
    rules: {
      ...vitestPlugin.configs.recommended.rules,
      'no-restricted-globals': 'off'
    }
  }
];
