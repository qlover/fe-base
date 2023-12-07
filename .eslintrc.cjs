module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: ['standard-with-typescript'],
  parser: '@typescript-eslint/parser',
  overrides: [
    {
      env: {
        node: true
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script'
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': 'error'
  }
}
