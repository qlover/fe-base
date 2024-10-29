import prettier from 'eslint-plugin-prettier';
import globals from 'globals';

export default {
  languageOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    globals: globals
  },
  plugins: {
    prettier: prettier
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
    'no-undef': 'error',
    'spaced-comment': 'error',
    'no-unused-vars': 'error'
  }
};
