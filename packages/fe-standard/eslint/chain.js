import tslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import lodash from 'lodash';
import tsRules from './ts.rules.js';
import js from '@eslint/js';
import prettierConfig from '../config/prettierrc.js';
const { merge } = lodash;

/**
 * Create typescript recommended config.
 *
 * @param {string[]} files
 * @returns {import('eslint').Linter.Config}
 */
export function createTslintRecommended(files) {
  let result = {};
  tslint.configs.recommended.forEach((config) => {
    result = merge(result, config);
  });

  if (files) {
    result.files = files;
  }

  // merge ts rules
  result.rules = {
    ...result.rules,
    ...tsRules
  };

  return result;
}

/**
 * Create a common config.
 *
 * default config for js and ts.
 *
 *
 * @param {string[]} files
 * @returns {import('eslint').Linter.Config}
 */
export function createCommon(files) {
  return {
    files: files || ['**/*.js', '**/*.ts'],
    languageOptions: {
      globals: {
        process: true,
        console: true
      }
    },
    plugins: {
      prettier: prettier
    },
    rules: {
      // TODO: import
      ...js.configs.recommended.rules,
      'prettier/prettier': ['error', prettierConfig],
      'spaced-comment': 'error'
    }
  };
}

/**
 * Add no-restricted-globals rule for browser environment.
 *
 * @param {import('eslint').Linter.Config} options
 * @returns {import('eslint').Linter.Config}
 */
export function chainEnv(options) {
  const { allGlobals, ...config } = options;
  const globals = config.languageOptions.globals;

  if (globals) {
    const allGlobalKeys = new Set([...Object.keys(allGlobals)]);
    const notAllowedGlobals = Array.from(allGlobalKeys).filter((key) => {
      return !(key in globals) || globals[key] == null;
    });

    return {
      ...config,
      rules: {
        ...config.rules,
        'no-restricted-globals': ['error', ...notAllowedGlobals]
      }
    };
  }

  return config;
}
