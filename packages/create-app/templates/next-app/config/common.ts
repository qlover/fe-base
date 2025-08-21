export const envPrefix = 'NEXT_PUBLIC_';

export const browserGlobalsName = 'feGlobals';

/**
 * 启动器环境变量注入黑名单
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

/**
 * 是否使用本地化路由
 *
 * - true: 使用本地化路由，路由会带有语言前缀 (例如: /en/home)
 * - false: 不使用本地化路由，直接使用路径 (例如: /home)
 */
export const useLocaleRoutes = true;
