const tsJestConfig = require('./packages/fe-standard/config/jest.esm.json');

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  ...tsJestConfig
};
