/** @type {import('jest').Config} */
export default {
  injectGlobals: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
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
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '!**/__tests__/helpers/**']
};
