export const envPrefix = 'NEXT_PUBLIC_';

export const browserGlobalsName = 'feGlobals';

export const loggerStyles = {
  fatal: { color: '#ff0000', fontWeight: 'bold' },
  error: { color: '#ff0000' },
  warn: { color: '#ffa500' },
  info: { color: '#0000ff' },
  debug: { color: '#008000' },
  trace: { color: '#808080' },
  log: { color: '#000000' }
};

/**
 * 是否使用本地化路由
 *
 * - true: 使用本地化路由，路由会带有语言前缀 (例如: /en/home)
 * - false: 不使用本地化路由，直接使用路径 (例如: /home)
 */
export const useLocaleRoutes = true;

/**
 * 是否使用API获取本地化数据
 *
 * - true: 使用API获取本地化数据，可以在 /admin/locales 页面中对他进行修改
 * - false: 不使用API获取本地化数据，直接使用 `@brain-toolkit/ts2locales` 生成的json数据
 */
export const useApiLocales = false;

/**
 * 是否在在 useWarnTranslations 中警告缺失的翻译,而不是抛出错误
 *
 * 如果为 false 则会抛出错误
 *
 * - true: 警告缺失的翻译
 * - false: 不警告缺失的翻译，而是默认行为
 *
 * @example
 * const t = useWarnTranslations();
 * t('missing_translation'); // 警告缺失的翻译
 */
export const i18nWarnMissingTranslation = true;

/**
 * 日志前缀模板
 *
 * 可支持的变量:
 *  - timestamp
 *  - level
 *  - loggerName
 *  - formattedTimestamp
 *  - locale
 *  - 传入的最后一个对象参数
 *
 * @example '[({loggerName}) {formattedTimestamp} {level}]'
 * @example
 *
 * ```ts
 * logger.log('message', { key: 'value' });
 * // 此时模板中可以使用 key 属性变量
 * ```
 *
 * nextjs 环境会自动捕获log再 .next/logs 目录下面，其中nextjs会根据调用 console[method] 方法名自动映射等级
 *
 * 所以这里可以简短的记录，但是控制台无法看到前缀
 */
export const logPrefixTemplate: string =
  '[({loggerName}) {formattedTimestamp} {level}]';
