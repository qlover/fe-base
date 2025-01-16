import tsJestConfig from '@qlover/fe-standard/config/jest.esm.js';

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  projects: [
    // {
    //   displayName: 'fe-utils',
    //   ...tsJestConfig,
    //   testMatch: tsJestConfig.testMatch.map(
    //     (item) => '<rootDir>/packages/fe-utils/' + item
    //   )
    // },
    {
      displayName: 'fe-scripts',
      ...tsJestConfig,
      testMatch: tsJestConfig.testMatch.map(
        (item) => '<rootDir>/packages/fe-scripts/' + item
      )
    }
  ],
  testPathIgnorePatterns: [
    '<rootDir>/packages/create-app/templates/react-vite-lib/'
  ]
};
