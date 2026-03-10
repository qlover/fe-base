/**
 * 注入配置到全局环境的变量名
 */
export const browserGlobalsName = 'reactSeed';

/**
 * 注入到浏览器全局变量中需要忽略的变量
 *
 * 应用 `@/core/globals.ts` 中的变量
 *
 * 可能 appConfig 有敏感信息，需要忽略
 *
 * - 可以直接忽略整个 appConfig 对象, 例如: 'appConfig'
 * - 也可以忽略单个属性, 例如: 'appConfig.openAiTokenPrefix', 'appConfig.openAiToken'
 *
 * @example 忽略 appConfig 对象
 * ```typescript
 * export const omitInjectedGlobals = [
 *   'appConfig'
 * ];
 * ```
 *
 * @example 忽略 appConfig 中的 openAiTokenPrefix 和 openAiToken 属性
 * ```typescript
 * export const omitInjectedGlobals = [
 *   'appConfig.openAiTokenPrefix',
 *   'appConfig.openAiToken'
 * ];
 * ```
 */
export const omitInjectedGlobals = [
  // 'IOC',
  // 'containerImpl',
  'seedConfig.aiApiToken'
];

/**
 * 路由前缀
 *
 * - 需要以 / 开头
 * - 但是不能只有 /
 *
 * **TODO: 未来可能需要修改为支持 vercel 环境使用前缀**
 * @example `/react-seed`
 */
export const routerPrefix = '';

/**
 * 是否使用本地化路径路由
 *
 * - true: 使用本地化路由，路由会带有语言前缀 (例如: /en/home)
 *   语言系统则会优先尝试解析路径中的语言
 *
 * - false: 不使用本地化路由，直接使用路径 (例如: /home)
 */
export const usePathLocaleRoute = true;

/**
 * 路由路径中的语言参数 key
 *
 * @example /en/home => lng='en'
 */
export const routePathLocaleParamKey = 'lng';

/**
 * 查询参数中的语言参数 key
 *
 * 按从左到右的顺序匹配
 *
 * @example ?lang=en&lng=en&language=en&locale=en&hl=en
 */
export const pathLocaleQSKeys = [
  'lang',
  'lng',
  'language',
  'locale',
  'hl'
] as const;
