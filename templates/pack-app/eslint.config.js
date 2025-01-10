import globals from 'globals';
import jest from 'eslint-plugin-jest';
import * as eslintChain from '@qlover/fe-standard/eslint/index.js';
import reactEslint from './packages/react-vite-lib/eslint.config.js';

const { createCommon, createTslintRecommended, chainEnv } = eslintChain;
const allGlobals = {
  ...globals.browser,
  ...globals.node,
  ...globals.jest
};

function createBrowserConfig() {
  return chainEnv({
    allGlobals,
    files: ['packages/browser/**/*.ts'],
    languageOptions: {
      globals: globals.browser
    }
  });
}

function createNodeConfig() {
  return chainEnv({
    allGlobals,
    files: ['packages/node/**/*.ts'],
    languageOptions: {
      globals: globals.node
    }
  });
}

function createReactConfig() {
  return chainEnv({
    allGlobals,
    files: ['packages/react/**/*.tsx'],
    ...reactEslint
  });
}

function createJESTConfig() {
  const config = chainEnv({
    allGlobals,
    files: ['packages/**/*.test.ts', 'packages/**/*.test.js'],
    plugins: {
      jest
    },
    languageOptions: {
      globals: {
        // ...globals.browser,
        ...globals.node,
        ...globals.jest
      }
    }
  });
  return config;
}

/**
 * @type {import('eslint').Linter.Config[]}
 */
export default [
  {
    ignores: ['**/dist/**', '**/build/**', '**/node_modules/**', 'templates/**']
  },
  // common js and ts
  createCommon(),
  createTslintRecommended(['packages/**/*.ts']),
  // browser
  createBrowserConfig(),
  // node
  createNodeConfig(),
  // react
  createReactConfig(),
  // jest
  createJESTConfig()
];
