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
