import type { ViteDeprecatedAntdOptions } from '@brain-toolkit/antd-theme-override/vite';

export const envPrefix = 'VITE_';

export const browserGlobalsName = 'feGlobals';

/**
 * 覆盖 antd 主题模式
 *
 * - noGlobals 不要使用全局的 antd 组件(推荐)
 * - overrideStatic 单独覆盖静态组件变量(这个文件就是这个作用)
 *
 * If use vite-deprecated-antd, automatically change file
 */
export const overrideAntdThemeMode: ViteDeprecatedAntdOptions['mode'] =
  'noGlobals';

/**
 * bootstrap ,not inject env
 */
export const envBlackList = ['env', 'userNodeEnv'];

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
 * 路由前缀
 *
 * - 需要以 / 开头
 * - 但是不能只有 /
 */
export const routerPrefix = '/router-root';
