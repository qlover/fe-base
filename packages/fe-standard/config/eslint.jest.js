import prettier from 'eslint-plugin-prettier';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';
import prettierConfig from './prettierrc.js';
import jest from 'eslint-plugin-jest';

/** @type {import('eslint').Linter.Config} */
export default {
  languageOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    globals: {
      ...globals.node,
      ...globals.jest
    },
    parser: tsParser
  },
  plugins: {
    '@typescript-eslint': typescriptEslint,
    prettier,
    jest
  },
  rules: {
    // prettier
    'prettier/prettier': ['error', prettierConfig],
    'arrow-body-style': 'off',
    'prefer-arrow-callback': 'off',
    // force function return type
    '@typescript-eslint/explicit-function-return-type': 'error',
    // can use any
    '@typescript-eslint/no-explicit-any': 'off',
    'no-undef': 'error',
    'spaced-comment': 'error',
    'no-unused-vars': 'off',
    // jest rules
    'jest/no-focused-tests': 'error',
    'jest/valid-expect': 'error',
    'jest/valid-expect-in-promise': 'error',
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
