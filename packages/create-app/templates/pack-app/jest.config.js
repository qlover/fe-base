import tsJestConfig from '@qlover/fe-standard/config/jest.esm.js';

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  // ...tsJestConfig,
  testEnvironment: 'jest-environment-jsdom',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  projects: [
    {
      ...tsJestConfig,
      displayName: 'pack-app-node',
      testMatch: tsJestConfig.testMatch.map(
        (item) => '<rootDir>/packages/node/' + item
      )
    },
    {
      ...tsJestConfig,
      displayName: 'pack-app-browser',
      testMatch: tsJestConfig.testMatch.map(
        (item) => '<rootDir>/packages/browser/' + item
      )
    },
    {
      ...tsJestConfig,
      displayName: 'pack-app-react',
      testEnvironment: 'jest-environment-jsdom',
      extensionsToTreatAsEsm: ['.ts', '.tsx'],
      testMatch: ['<rootDir>/packages/react-vite-lib/__tests__/**/*.test.tsx']
    }
  ]
};
