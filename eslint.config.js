import globals from 'globals';
import jest from 'eslint-plugin-jest';
import * as eslintChain from '@qlover/fe-standard/eslint/index.js';

const { createCommon, createTslintRecommended, chainEnv } = eslintChain;
const allGlobals = {
  ...globals.browser,
  ...globals.node,
  ...globals.jest
};

function createFeUtilsConfig() {
  const feUtilsCommon = chainEnv({
    allGlobals,
    files: ['packages/fe-utils/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node
        // console: null
      }
    }
  });
  const feUtilsServer = chainEnv({
    allGlobals,
    files: ['packages/fe-utils/server/**/*.ts'],
    languageOptions: {
      globals: globals.node
    }
  });
  const feUtilsBrowser = chainEnv({
    allGlobals,
    files: ['packages/fe-utils/browser/**/*.ts'],
    languageOptions: {
      globals: globals.browser
    }
  });

  return [feUtilsCommon, feUtilsServer, feUtilsBrowser];
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
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/node_modules/**',
      'packages/create-app/templates'
    ]
  },
  // common js and ts
  createCommon(),
  createTslintRecommended(['packages/**/*.ts']),

  // fe-utils
  ...createFeUtilsConfig(),

  // jest
  createJESTConfig()
];
