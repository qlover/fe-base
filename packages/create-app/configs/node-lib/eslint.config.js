import js from '@eslint/js';
import globals from 'globals';
import prettierConfig from '../../packages/node-lib/.prettierrc.js';
import prettier from 'eslint-plugin-prettier';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import * as feDev from '@qlover/eslint-plugin-fe-dev';

export default [
  {
    ignores: ['dist', 'node_modules']
  },
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
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
    plugins: {
      prettier,
      '@typescript-eslint': tseslint,
      'fe-dev': feDev
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
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
      'fe-dev/ts-class-method-return': 'error'
    }
  }
];
