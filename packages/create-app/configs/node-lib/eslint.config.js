import js from '@eslint/js';
import globals from 'globals';
import prettierConfig from '../../packages/node-lib/.prettierrc.js';
import prettier from 'eslint-plugin-prettier';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import qloverEslint from '@qlover/eslint-plugin';

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
      '@qlover-eslint': qloverEslint
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
      '@qlover-eslint/ts-class-method-return': 'error'
    }
  }
];
