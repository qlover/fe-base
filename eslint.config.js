import globals from 'globals';
import jest from 'eslint-plugin-jest';
import * as eslintChain from '@qlover/fe-standard/eslint/index.js';

const { createCommon, createTslintRecommended, chainEnv } = eslintChain;

function createFeUtilsConfig() {
  const feUtilsCommon = chainEnv({
    files: ['packages/fe-utils/**/*.ts'],
    languageOptions: {
      globals: {
        process: true,
        console: true
      }
    }
  });
  const feUtilsServer = chainEnv({
    files: ['packages/fe-utils/server/**/*.ts'],
    languageOptions: {
      globals: globals.node
    }
  });
  const feUtilsBrowser = chainEnv({
    files: ['packages/fe-utils/browser/**/*.ts'],
    languageOptions: {
      globals: globals.browser
    }
  });

  return [feUtilsCommon, feUtilsServer, feUtilsBrowser];
}

/**
 * @type {import('eslint').Linter.Config[]}
 */
export default [
  {
    ignores: ['**/dist/**', '**/build/**', '**/node_modules/**']
  },
  // common js and ts
  createCommon(),
  createTslintRecommended(['packages/**/*.ts']),

  // fe-utils
  ...createFeUtilsConfig(),

  // jest
  chainEnv({
    files: ['packages/**/*.test.ts', 'packages/**/*.test.js'],
    plugins: {
      jest
    },
    languageOptions: {
      globals: globals.jest
    }
  })
];
