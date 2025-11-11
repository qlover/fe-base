/**
 * 禁用特定的全局变量（使用 ESLint 原生 globals 配置）
 * 这是最简洁的方式，直接在 languageOptions.globals 中设置为 'off'
 *
 * @param {import('eslint').Linter.Config} config - ESLint 配置对象
 * @param {Object} options - 配置选项
 * @param {string[]} options.disabledGlobals - 要禁用的全局变量列表
 * @returns {import('eslint').Linter.Config}
 *
 * @example
 * // 禁用 window, document 等全局变量
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
 */
export function disableGlobals(config, options = {}) {
  const { disabledGlobals = [] } = options;

  const disabledGlobalsConfig = {};
  disabledGlobals.forEach((name) => {
    disabledGlobalsConfig[name] = 'off';
  });

  return {
    ...config,
    languageOptions: {
      ...config.languageOptions,
      globals: {
        ...(config.languageOptions && config.languageOptions.globals),
        ...disabledGlobalsConfig
      }
    }
  };
}

/**
 * 限制特定的浏览器全局变量（黑名单模式，使用 no-restricted-globals 规则）
 * 只需指定要禁止的变量，其他全部允许
 * 相比 disableGlobals，此方法可以提供自定义错误消息
 *
 * @param {import('eslint').Linter.Config} config - ESLint 配置对象
 * @param {Object} options - 配置选项
 * @param {string[]} options.restrictedGlobals - 禁止使用的全局变量列表
 * @param {string | ((name: string) => string)} [options.message] - 自定义错误消息，支持模板字符串（使用 ${name}）或函数
 * @param {Record<string, string>} [options.customMessages] - 为特定全局变量自定义消息
 * @returns {import('eslint').Linter.Config}
 *
 * @example
 * // 只禁止 window, document 等少数变量
 * restrictSpecificGlobals(
 *   {
 *     files: ['src/**\/*.{ts,tsx}'],
 *     languageOptions: { globals: globals.browser },
 *     rules: {}
 *   },
 *   {
 *     restrictedGlobals: ['window', 'document', 'localStorage'],
 *     message: '❌ 禁止使用 ${name}，请从 @/core/globals 导入',
 *     customMessages: {
 *       window: '❌ 禁止直接使用 window 对象'
 *     }
 *   }
 * )
 */
export function restrictSpecificGlobals(config, options = {}) {
  const { restrictedGlobals = [], message, customMessages = {} } = options;

  // 默认消息模板
  const defaultMessage =
    message ||
    '不允许直接使用 ${name}，请从 @/core/globals 导入或使用允许的替代方案';

  // 生成消息的函数
  const generateMessage = (name) => {
    // 优先使用自定义消息
    if (customMessages[name]) {
      return customMessages[name];
    }

    // 如果 message 是函数，调用它
    if (typeof defaultMessage === 'function') {
      return defaultMessage(name);
    }

    // 如果是字符串模板，替换 ${name}
    return defaultMessage.replace(/\$\{name\}/g, name);
  };

  // 构建限制规则
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
 * 自动生成 no-restricted-globals 规则，限制所有未明确允许的浏览器全局变量（白名单模式）
 *
 * @param {import('eslint').Linter.Config} config - ESLint 配置对象
 * @param {Object} options - 配置选项
 * @param {string[]} options.allowedGlobals - 允许使用的全局变量列表
 * @param {Record<string, any>} [options.allGlobals] - 所有浏览器全局变量（如 globals.browser），如果不提供则从 config.languageOptions.globals 获取
 * @param {string | ((name: string) => string)} [options.message] - 自定义错误消息，支持模板字符串（使用 ${name}）或函数
 * @param {Record<string, string>} [options.customMessages] - 为特定全局变量自定义消息
 * @returns {import('eslint').Linter.Config}
 *
 * @example
 * // 从 languageOptions.globals 自动获取（推荐）
 * restrictGlobals(
 *   {
 *     files: ['src/**\/*.{ts,tsx}'],
 *     languageOptions: { globals: globals.browser },
 *     rules: {}
 *   },
 *   {
 *     allowedGlobals: ['console', 'setTimeout'],
 *     message: '❌ 禁止使用 ${name}',
 *     customMessages: {
 *       window: '❌ window 请从 @/core/globals 导入'
 *     }
 *   }
 * )
 *
 * @example
 * // 使用函数形式的消息
 * restrictGlobals(config, {
 *   allowedGlobals: ['console'],
 *   message: (name) => `不允许使用全局变量 "${name}"`
 * })
 */
export function restrictGlobals(config, options = {}) {
  const {
    allowedGlobals = [],
    allGlobals,
    message,
    customMessages = {}
  } = options;

  // 优先从 options 获取 allGlobals，否则从 config.languageOptions.globals 获取
  const globals = allGlobals || (config.languageOptions && config.languageOptions.globals) || {};
  const allGlobalKeys = Object.keys(globals);
  const allowedSet = new Set(allowedGlobals);

  // 默认消息模板
  const defaultMessage =
    message ||
    '不允许直接使用 ${name}，请从 @/core/globals 导入或使用允许的替代方案';

  // 生成消息的函数
  const generateMessage = (name) => {
    // 优先使用自定义消息
    if (customMessages[name]) {
      return customMessages[name];
    }

    // 如果 message 是函数，调用它
    if (typeof defaultMessage === 'function') {
      return defaultMessage(name);
    }

    // 如果是字符串模板，替换 ${name}
    return defaultMessage.replace(/\$\{name\}/g, name);
  };

  // 过滤出不允许使用的全局变量
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
