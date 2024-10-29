import prettier from 'eslint-plugin-prettier';

export default {
  languageOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    globals: {
      browser: true,
      node: true
    }
  },
  plugins: {
    prettier: prettier
  },
  rules: {
    'prettier/prettier': 'error',
    'arrow-body-style': 'off',
    'prefer-arrow-callback': 'off'
  }
};
