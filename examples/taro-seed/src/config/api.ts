/**
 * 后端 API 基础地址，可按环境在构建时替换
 * 开发时可在 .env 或 config 中配置
 */
export const API_BASE =
  (typeof process !== 'undefined' && process.env?.VITE_API_BASE) || '';

export const AUTH_LOGIN_PATH = '/auth/wx-login';
export const AUTH_LOGOUT_PATH = '/auth/logout';
export const AUTH_USER_INFO_PATH = '/auth/user-info';
