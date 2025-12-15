import type { Linter } from 'eslint';

/**
 * Configuration options for disabling specific global variables
 *
 * This interface is used with `disableGlobals` function to configure which global
 * variables should be disabled in ESLint configuration.
 */
export interface DisableGlobalsOptions {
  /**
   * List of global variable names to disable
   *
   * These global variables will be set to `'off'` in ESLint's `languageOptions.globals`,
   * which means ESLint will not recognize them as valid globals and will report
   * errors if they are used without declaration.
   *
   * @default `[]`
   *
   * @example
   * ```typescript
   * disabledGlobals: ['window', 'document', 'localStorage']
   * ```
   */
  disabledGlobals?: string[];
}

/**
 * Configuration options for restricting specific global variables (blacklist mode)
 *
 * This interface is used with `restrictSpecificGlobals` function to configure
 * which specific global variables should be restricted. Only the specified
 * variables will be restricted, all others remain allowed.
 */
export interface RestrictSpecificGlobalsOptions {
  /**
   * List of global variable names to restrict
   *
   * Only these specified variables will be restricted. All other global variables
   * will remain allowed. This is useful when you only want to restrict a few
   * specific globals rather than restricting everything.
   *
   * @default `[]`
   *
   * @example
   * ```typescript
   * restrictedGlobals: ['window', 'document', 'localStorage']
   * ```
   */
  restrictedGlobals?: string[];
  /**
   * Custom error message template or function
   *
   * Supports two formats:
   * - String template with `${name}` placeholder that will be replaced with the variable name
   * - Function that receives the variable name and returns a custom message
   *
   * If not provided, a default message will be used.
   *
   * @default `'Do not use ${name} directly, import from @/core/globals or use an allowed alternative'`
   *
   * @example
   * ```typescript
   * // String template
   * message: 'Do not use ${name} directly, import from @/core/globals'
   *
   * // Function
   * message: (name) => `Global variable "${name}" is not allowed`
   * ```
   */
  message?: string | ((name: string) => string);
  /**
   * Custom messages for specific global variables
   *
   * Allows you to provide different error messages for different global variables.
   * The key is the global variable name, and the value is the custom error message
   * that will be shown when that specific variable is used.
   *
   * These custom messages take precedence over the `message` option.
   *
   * @default `{}`
   *
   * @example
   * ```typescript
   * customMessages: {
   *   window: 'Do not use window object directly, use global window from @/core/globals',
   *   document: 'Do not use document directly, use global document from @/core/globals'
   * }
   * ```
   */
  customMessages?: Record<string, string>;
}

/**
 * Configuration options for restricting globals (whitelist mode)
 *
 * This interface is used with `restrictGlobals` function to configure which
 * global variables are allowed. All global variables not in the allowed list
 * will be restricted.
 */
export interface RestrictGlobalsOptions {
  /**
   * List of global variable names that are allowed
   *
   * Only these global variables will be allowed. All other global variables
   * (from `allGlobals` or `config.languageOptions.globals`) will be restricted.
   * This is a whitelist approach - everything is restricted except what's explicitly allowed.
   *
   * @default `[]`
   *
   * @example
   * ```typescript
   * allowedGlobals: ['console', 'setTimeout', 'clearTimeout']
   * ```
   */
  allowedGlobals?: string[];
  /**
   * All browser global variables (e.g., globals.browser)
   *
   * This should contain all the global variables that are available in the environment.
   * If not provided, the function will automatically extract them from
   * `config.languageOptions.globals`.
   *
   * It's recommended to let the function extract from `config.languageOptions.globals`
   * automatically, but you can provide this explicitly if needed.
   *
   * @default Extracted from `config.languageOptions.globals`
   *
   * @example
   * ```typescript
   * import globals from 'globals';
   * allGlobals: globals.browser
   * ```
   */
  allGlobals?: Record<string, unknown>;
  /**
   * Custom error message template or function
   *
   * Supports two formats:
   * - String template with `${name}` placeholder that will be replaced with the variable name
   * - Function that receives the variable name and returns a custom message
   *
   * If not provided, a default message will be used.
   *
   * @default `'Do not use ${name} directly, import from @/core/globals or use an allowed alternative'`
   *
   * @example
   * ```typescript
   * // String template
   * message: 'Do not use ${name} directly, import from @/core/globals'
   *
   * // Function
   * message: (name) => `Global variable "${name}" is not allowed, use allowed alternatives`
   * ```
   */
  message?: string | ((name: string) => string);
  /**
   * Custom messages for specific global variables
   *
   * Allows you to provide different error messages for different global variables.
   * The key is the global variable name, and the value is the custom error message
   * that will be shown when that specific variable is used.
   *
   * These custom messages take precedence over the `message` option.
   *
   * @default `{}`
   *
   * @example
   * ```typescript
   * customMessages: {
   *   window: 'Do not use window object directly, use global window from @/core/globals',
   *   document: 'Do not use document directly, use global document from @/core/globals',
   *   localStorage: 'Do not use localStorage directly, use storage from @/core/globals'
   * }
   * ```
   */
  customMessages?: Record<string, string>;
}

/**
 * Disable specific global variables using ESLint's native globals configuration
 *
 * This is the most concise way to disable global variables. It directly sets
 * the specified globals to `'off'` in ESLint's `languageOptions.globals`,
 * which means ESLint will not recognize them as valid globals and will report
 * errors if they are used without declaration.
 *
 * **Use cases:**
 * - When you want to completely disable certain browser globals
 * - When you want ESLint to treat these variables as undefined
 * - When you prefer ESLint's native globals configuration over rules
 *
 * **Comparison with other functions:**
 * - `disableGlobals`: Sets globals to `'off'` - ESLint won't recognize them at all
 * - `restrictSpecificGlobals`: Uses `no-restricted-globals` rule - allows custom error messages
 * - `restrictGlobals`: Whitelist mode - restricts everything except allowed ones
 *
 * @param config - ESLint configuration object to modify
 * @param options - Configuration options
 * @param options.disabledGlobals - List of global variable names to disable.
 *   These will be set to `'off'` in `languageOptions.globals`.
 * @returns Modified ESLint configuration object with disabled globals set to `'off'`
 *
 * @example Basic usage
 * ```typescript
 * import globals from 'globals';
 * import { disableGlobals } from '@your-plugin/utils';
 *
 * export default disableGlobals(
 *   {
 *     files: ['src/**\/*.{ts,tsx}'],
 *     languageOptions: { globals: globals.browser },
 *     rules: {}
 *   },
 *   {
 *     disabledGlobals: ['window', 'document', 'localStorage']
 *   }
 * );
 * ```
 *
 * @example Disable multiple globals
 * ```typescript
 * disableGlobals(config, {
 *   disabledGlobals: [
 *     'window',
 *     'document',
 *     'localStorage',
 *     'sessionStorage',
 *     'navigator'
 *   ]
 * });
 * ```
 */
export function disableGlobals(
  config: Linter.Config,
  options: DisableGlobalsOptions = {}
): Linter.Config {
  const { disabledGlobals = [] } = options;

  const disabledGlobalsConfig: Record<string, 'off'> = {};
  disabledGlobals.forEach((name) => {
    disabledGlobalsConfig[name] = 'off';
  });

  return {
    ...config,
    languageOptions: {
      ...config.languageOptions,
      globals: {
        ...(config.languageOptions?.globals as Linter.Globals),
        ...disabledGlobalsConfig
      } as Linter.Globals
    }
  };
}

/**
 * Restrict specific browser global variables (blacklist mode, using no-restricted-globals rule)
 *
 * This function restricts only the specified global variables while allowing all others.
 * It uses ESLint's `no-restricted-globals` rule, which provides better error messages
 * compared to `disableGlobals`.
 *
 * **Use cases:**
 * - When you only want to restrict a few specific globals (blacklist approach)
 * - When you need custom error messages for restricted globals
 * - When you want to guide developers to use alternatives (e.g., import from @/core/globals)
 *
 * **Comparison with other functions:**
 * - `disableGlobals`: Sets globals to `'off'` - ESLint won't recognize them at all
 * - `restrictSpecificGlobals`: Uses `no-restricted-globals` rule - only restricts specified ones
 * - `restrictGlobals`: Whitelist mode - restricts everything except allowed ones
 *
 * @param config - ESLint configuration object to modify
 * @param options - Configuration options
 * @param options.restrictedGlobals - List of global variable names to restrict.
 *   Only these variables will be restricted, all others remain allowed.
 * @param options.message - Custom error message template or function.
 *   Supports `${name}` placeholder or a function that receives the variable name.
 * @param options.customMessages - Custom messages for specific global variables.
 *   Key is the global variable name, value is the custom error message.
 *   These take precedence over the `message` option.
 * @returns Modified ESLint configuration object with `no-restricted-globals` rule configured
 *
 * @example Basic usage with custom message
 * ```typescript
 * import globals from 'globals';
 * import { restrictSpecificGlobals } from '@your-plugin/utils';
 *
 * export default restrictSpecificGlobals(
 *   {
 *     files: ['src/**\/*.{ts,tsx}'],
 *     languageOptions: { globals: globals.browser },
 *     rules: {}
 *   },
 *   {
 *     restrictedGlobals: ['window', 'document', 'localStorage'],
 *     message: 'Do not use ${name} directly, import from @/core/globals'
 *   }
 * );
 * ```
 *
 * @example With custom messages for specific variables
 * ```typescript
 * restrictSpecificGlobals(config, {
 *   restrictedGlobals: ['window', 'document', 'localStorage'],
 *   message: 'Do not use ${name} directly',
 *   customMessages: {
 *     window: 'Do not use window object directly, use global window from @/core/globals',
 *     document: 'Do not use document directly, use global document from @/core/globals',
 *     localStorage: 'Do not use localStorage directly, use storage from @/core/globals'
 *   }
 * });
 * ```
 *
 * @example Using function for message
 * ```typescript
 * restrictSpecificGlobals(config, {
 *   restrictedGlobals: ['window', 'document'],
 *   message: (name) => `Global variable "${name}" is restricted. Use alternative from @/core/globals`
 * });
 * ```
 */
export function restrictSpecificGlobals(
  config: Linter.Config,
  options: RestrictSpecificGlobalsOptions = {}
): Linter.Config {
  const { restrictedGlobals = [], message, customMessages = {} } = options;

  // Default message template
  const defaultMessage =
    message ||
    'Do not use ${name} directly, import from @/core/globals or use an allowed alternative';

  // Function to generate message
  const generateMessage = (name: string): string => {
    // Prioritize custom messages
    if (customMessages[name]) {
      return customMessages[name];
    }

    // If message is a function, call it
    if (typeof defaultMessage === 'function') {
      return defaultMessage(name);
    }

    // If it's a string template, replace ${name}
    return defaultMessage.replace(/\$\{name\}/g, name);
  };

  // Build restriction rule configuration
  const restrictedGlobalsConfig = restrictedGlobals.map((name) => ({
    name,
    message: generateMessage(name)
  }));

  return {
    ...config,
    rules: {
      ...config.rules,
      'no-restricted-globals': ['error', ...restrictedGlobalsConfig]
    }
  };
}

/**
 * Automatically generate no-restricted-globals rule to restrict all browser global variables
 * that are not explicitly allowed (whitelist mode)
 *
 * This function implements a whitelist approach: it restricts all global variables except
 * those explicitly listed in `allowedGlobals`. It automatically extracts all available
 * globals from the configuration and restricts everything that's not in the allowed list.
 *
 * **Use cases:**
 * - When you want to restrict most globals and only allow a few (whitelist approach)
 * - When you want to enforce using alternatives (e.g., import from @/core/globals) for most globals
 * - When you want to automatically restrict all browser globals except a small allowed set
 *
 * **Comparison with other functions:**
 * - `disableGlobals`: Sets globals to `'off'` - ESLint won't recognize them at all
 * - `restrictSpecificGlobals`: Blacklist mode - only restricts specified ones
 * - `restrictGlobals`: Whitelist mode - restricts everything except allowed ones
 *
 * @param config - ESLint configuration object to modify
 * @param options - Configuration options
 * @param options.allowedGlobals - List of allowed global variable names.
 *   Only these variables will be allowed, all others will be restricted.
 * @param options.allGlobals - All browser global variables (e.g., `globals.browser`).
 *   If not provided, will be automatically extracted from `config.languageOptions.globals`.
 *   It's recommended to let the function extract automatically.
 * @param options.message - Custom error message template or function.
 *   Supports `${name}` placeholder or a function that receives the variable name.
 * @param options.customMessages - Custom messages for specific global variables.
 *   Key is the global variable name, value is the custom error message.
 *   These take precedence over the `message` option.
 * @returns Modified ESLint configuration object with `no-restricted-globals` rule configured
 *
 * @example Basic usage (recommended - auto-extract from config)
 * ```typescript
 * import globals from 'globals';
 * import { restrictGlobals } from '@your-plugin/utils';
 *
 * export default restrictGlobals(
 *   {
 *     files: ['src/**\/*.{ts,tsx}'],
 *     languageOptions: { globals: globals.browser },
 *     rules: {}
 *   },
 *   {
 *     allowedGlobals: ['console', 'setTimeout', 'clearTimeout'],
 *     message: 'Do not use ${name} directly, import from @/core/globals'
 *   }
 * );
 * ```
 *
 * @example With custom messages for specific variables
 * ```typescript
 * restrictGlobals(config, {
 *   allowedGlobals: ['console', 'setTimeout'],
 *   message: 'Do not use ${name}',
 *   customMessages: {
 *     window: 'Do not use window, import from @/core/globals',
 *     document: 'Do not use document, import from @/core/globals',
 *     localStorage: 'Do not use localStorage, use storage from @/core/globals'
 *   }
 * });
 * ```
 *
 * @example Using function for message
 * ```typescript
 * restrictGlobals(config, {
 *   allowedGlobals: ['console'],
 *   message: (name) => `Global variable "${name}" is not allowed. Use alternative from @/core/globals`
 * });
 * ```
 *
 * @example Explicitly providing allGlobals
 * ```typescript
 * import globals from 'globals';
 *
 * restrictGlobals(config, {
 *   allowedGlobals: ['console'],
 *   allGlobals: globals.browser
 * });
 * ```
 */
export function restrictGlobals(
  config: Linter.Config,
  options: RestrictGlobalsOptions = {}
): Linter.Config {
  const {
    allowedGlobals = [],
    allGlobals,
    message,
    customMessages = {}
  } = options;

  // Prioritize allGlobals from options, otherwise extract from config.languageOptions.globals
  const globals =
    (allGlobals as Linter.Globals) ||
    (config.languageOptions?.globals as Linter.Globals) ||
    ({} as Linter.Globals);
  const allGlobalKeys = Object.keys(globals);
  const allowedSet = new Set(allowedGlobals);

  // Default message template
  const defaultMessage =
    message ||
    'Do not use ${name} directly, import from @/core/globals or use an allowed alternative';

  // Function to generate message
  const generateMessage = (name: string): string => {
    // Prioritize custom messages
    if (customMessages[name]) {
      return customMessages[name];
    }

    // If message is a function, call it
    if (typeof defaultMessage === 'function') {
      return defaultMessage(name);
    }

    // If it's a string template, replace ${name}
    return defaultMessage.replace(/\$\{name\}/g, name);
  };

  // Filter out global variables that are not allowed
  const restrictedGlobals = allGlobalKeys
    .filter((key) => !allowedSet.has(key))
    .map((name) => ({
      name,
      message: generateMessage(name)
    }));

  return {
    ...config,
    rules: {
      ...config.rules,
      'no-restricted-globals': ['error', ...restrictedGlobals]
    }
  };
}
