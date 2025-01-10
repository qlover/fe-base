import tsJestConfig from '@qlover/fe-standard/config/jest.esm.js';

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  ...tsJestConfig,
  testMatch: tsJestConfig.testMatch.map((item) => '<rootDir>/packages/' + item)
};
