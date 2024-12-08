import prettier from 'eslint-plugin-prettier';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';
import prettierConfig from './prettierrc.js';

/** @type {import('eslint').Linter.Config} */
export default {
  languageOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    globals: {
      ...globals.node,
      ...globals.browser,
      RequestInit: true
    },
    parser: tsParser
  },
  plugins: {
    '@typescript-eslint': typescriptEslint,
    prettier
  },
  rules: {
    // prettier
    'prettier/prettier': ['error', prettierConfig],
    'arrow-body-style': 'off',
    'prefer-arrow-callback': 'off',
    // force function return type
    '@typescript-eslint/explicit-function-return-type': 'error',
    // not use any
    '@typescript-eslint/no-explicit-any': 'error',
    'no-undef': 'error',
    'spaced-comment': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'none',
        ignoreRestSiblings: true,
        varsIgnorePattern: '^_',
        caughtErrors: 'none'
      }
    ]
  }
};
