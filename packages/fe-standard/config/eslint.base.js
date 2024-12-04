import prettier from 'eslint-plugin-prettier';
import globals from 'globals';
import prettierConfig from './prettierrc.js';

/** @type {import('eslint').Linter.Config} */
export default {
  languageOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    globals: {
      ...globals.node,
      ...globals.browser
    }
  },
  plugins: {
    prettier: prettier
  },
  rules: {
    'prettier/prettier': ['error', prettierConfig],
    'arrow-body-style': 'off',
    'prefer-arrow-callback': 'off',
    'no-undef': 'error',
    'spaced-comment': 'error',
    'no-unused-vars': 'error'
  }
};
