/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  injectGlobals: true,
  testEnvironment: 'node',
  // 添加以下配置支持 ESM
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true
      }
    ]
  },
  // 只测试 __tests__ 目录
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '!**/__tests__/helpers/**'
  ]
};
