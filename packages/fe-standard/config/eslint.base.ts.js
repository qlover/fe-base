import prettier from 'eslint-plugin-prettier';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';

export default {
  languageOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    globals: globals,
    parser: tsParser
  },
  plugins: {
    '@typescript-eslint': typescriptEslint,
    prettier
  },
  rules: {
    'prettier/prettier': [
      'error',
      {
        semi: true,
        singleQuote: true,
        trailingComma: 'none',
        endOfLine: 'lf'
      }
    ],
    'arrow-body-style': 'off',
    'prefer-arrow-callback': 'off',
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/no-explicit-any': 'off'
  }
};
