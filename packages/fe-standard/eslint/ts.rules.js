/** @type {import('eslint').Linter.Config} */
export default {
  // force function return type
  '@typescript-eslint/explicit-function-return-type': 'error',
  // not use any
  '@typescript-eslint/no-explicit-any': 'error',
  // allow ts-comment
  '@typescript-eslint/ban-ts-comment': 'off',
  // allow empty object type
  '@typescript-eslint/no-empty-object-type': 'off',
  // not allow unused vars
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
