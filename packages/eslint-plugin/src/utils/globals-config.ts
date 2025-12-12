import type { Linter } from 'eslint';

/**
 * Configuration options for disabling specific global variables
 */
export interface DisableGlobalsOptions {
  /**
   * List of global variable names to disable
   */
  disabledGlobals?: string[];
}

/**
 * Configuration options for restricting specific global variables (blacklist mode)
 */
export interface RestrictSpecificGlobalsOptions {
  /**
   * List of global variable names to restrict
   */
  restrictedGlobals?: string[];
  /**
   * Custom error message template or function
   * Supports template string with ${name} placeholder or a function that receives the variable name
   */
  message?: string | ((name: string) => string);
  /**
   * Custom messages for specific global variables
   * Key is the global variable name, value is the custom error message
   */
  customMessages?: Record<string, string>;
}

/**
 * Configuration options for restricting globals (whitelist mode)
 */
export interface RestrictGlobalsOptions {
  /**
   * List of global variable names that are allowed
   */
  allowedGlobals?: string[];
  /**
   * All browser global variables (e.g., globals.browser)
   * If not provided, will be extracted from config.languageOptions.globals
   */
  allGlobals?: Record<string, unknown>;
  /**
   * Custom error message template or function
   * Supports template string with ${name} placeholder or a function that receives the variable name
   */
  message?: string | ((name: string) => string);
  /**
   * Custom messages for specific global variables
   * Key is the global variable name, value is the custom error message
   */
  customMessages?: Record<string, string>;
}

/**
 * Disable specific global variables using ESLint's native globals configuration
 * This is the most concise way, directly setting globals to 'off' in languageOptions.globals
 *
 * @since 1.1.0
 * @param config - ESLint configuration object
 * @param options - Configuration options
 * @param options.disabledGlobals - List of global variable names to disable
 * @returns Modified ESLint configuration object
 *
 * @example
 * ```typescript
 * // Disable window, document, etc.
 * disableGlobals(
 *   {
 *     files: ['src/**\/*.{ts,tsx}'],
 *     languageOptions: { globals: globals.browser },
 *     rules: {}
 *   },
 *   {
 *     disabledGlobals: ['window', 'document', 'localStorage']
 *   }
 * )
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
 * Only specify the variables to prohibit, all others are allowed
 * Compared to disableGlobals, this method can provide custom error messages
 *
 * @since 1.1.0
 * @param config - ESLint configuration object
 * @param options - Configuration options
 * @param options.restrictedGlobals - List of global variable names to restrict
 * @param options.message - Custom error message template or function
 * @param options.customMessages - Custom messages for specific global variables
 * @returns Modified ESLint configuration object
 *
 * @example
 * ```typescript
 * // Only prohibit window, document, etc.
 * restrictSpecificGlobals(
 *   {
 *     files: ['src/**\/*.{ts,tsx}'],
 *     languageOptions: { globals: globals.browser },
 *     rules: {}
 *   },
 *   {
 *     restrictedGlobals: ['window', 'document', 'localStorage'],
 *     message: 'Do not use ${name} directly, import from @/core/globals',
 *     customMessages: {
 *       window: 'Do not use window object directly'
 *     }
 *   }
 * )
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
 * @since 1.1.0
 * @param config - ESLint configuration object
 * @param options - Configuration options
 * @param options.allowedGlobals - List of allowed global variable names
 * @param options.allGlobals - All browser global variables (e.g., globals.browser)
 *   If not provided, will be extracted from config.languageOptions.globals
 * @param options.message - Custom error message template or function
 * @param options.customMessages - Custom messages for specific global variables
 * @returns Modified ESLint configuration object
 *
 * @example
 * ```typescript
 * // Automatically extract from languageOptions.globals (recommended)
 * restrictGlobals(
 *   {
 *     files: ['src/**\/*.{ts,tsx}'],
 *     languageOptions: { globals: globals.browser },
 *     rules: {}
 *   },
 *   {
 *     allowedGlobals: ['console', 'setTimeout'],
 *     message: 'Do not use ${name}',
 *     customMessages: {
 *       window: 'Do not use window, import from @/core/globals'
 *     }
 *   }
 * )
 * ```
 *
 * @example
 * ```typescript
 * // Using function form for message
 * restrictGlobals(config, {
 *   allowedGlobals: ['console'],
 *   message: (name) => `Do not use global variable "${name}"`
 * })
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
