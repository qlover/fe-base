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
    // work root
    {
      ...require('./packages/_work/eslintrc.json'),
      files: ['./packages/_work/*.js']
    },
    // src root
    {
      ...require('./src/eslintrc.json'),
      files: ['./src/*.js', './src/*.ts']
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname
  }
}
