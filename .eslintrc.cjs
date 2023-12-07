module.exports = {
  overrides: [
    {
      env: {
        node: true
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script'
      }
    },
    {
      ...require('./src/eslintrc.json'),
      files: ['./src/*.js', './src/*.ts']
    },
    {
      ...require('./packages/work/eslintrc.json'),
      files: ['./packages/work/*.js']
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname
  }
}
