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
export const useApiLocales = true;

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
