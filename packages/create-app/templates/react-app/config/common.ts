export const envPrefix = 'VITE_';

export const browserGlobalsName = 'feGlobals';

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
