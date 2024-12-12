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
      'prettier/prettier': ['error', prettierConfig]
    }
  };
}

/**
 * Add no-restricted-globals rule for browser environment.
 *
 * @param {import('eslint').Linter.Config} config
 * @returns {import('eslint').Linter.Config}
 */
export function chainEnv(config) {
  const globals = config.languageOptions.globals || config.globals;

  if (globals && config.rules && config.rules['no-restricted-globals']) {
    notAllowedGlobals = Object.keys(globals).filter(
      (key) => !Object.keys(globals.browser).includes(key)
    );
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
