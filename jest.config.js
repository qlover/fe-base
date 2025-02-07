import tsJestConfig from '@qlover/fe-standard/config/jest.esm.js';

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  // ...tsJestConfig,
  // testMatch: tsJestConfig.testMatch.map((item) => '<rootDir>/packages/' + item),
  testPathIgnorePatterns: [
    '<rootDir>/packages/create-app/templates/react-vite-lib/'
  ],
  projects: [
    {
      displayName: 'env-loader',
      ...tsJestConfig,
      testMatch: tsJestConfig.testMatch.map(
        (item) => '<rootDir>/packages/env-loader/' + item
      )
    },
    {
      displayName: 'fe-utils',
      ...tsJestConfig,
      testMatch: tsJestConfig.testMatch.map(
        (item) => '<rootDir>/packages/fe-utils/' + item
      )
    },
    {
      displayName: 'scripts-context',
      ...tsJestConfig,
      testMatch: tsJestConfig.testMatch.map(
        (item) => '<rootDir>/packages/scripts-context/' + item
      )
    },

    /**
     * 当测试有 依赖其他模块只有是 es 模块时，需要在测试时转码成cjs
     */
    {
      displayName: 'release',
      ...tsJestConfig,
      // 让 Jest 转换 chalk 包
      transformIgnorePatterns: ['/node_modules/(?!chalk)/'],
      testMatch: tsJestConfig.testMatch.map(
        (item) => '<rootDir>/packages/release/' + item
      ),
      transform: {
        ...tsJestConfig.transform,
        '^.+\\.[jt]sx?$': ['babel-jest', { rootMode: 'upward' }]
      }
    }
  ]
};
