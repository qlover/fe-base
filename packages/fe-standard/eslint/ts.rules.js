/** @type {import('eslint').Linter.Config} */
export default {
  // force function return type
  '@typescript-eslint/explicit-function-return-type': 'error',
  // not use any
  '@typescript-eslint/no-explicit-any': 'error',
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
};
