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
    }
  ]
};
