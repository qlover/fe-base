/**
 * 用于标识唯一的错误信息
 *
 * 可能的地方
 *
 * 1. 逻辑执行错误的唯一 id
 * 2. 错误信息的唯一 id(后期需要维护一个与之对应的 local, 这个值可能就是一个 local 的 key)
 */

/**
 * IOC 未实现
 */
export const APP_IOC_NOT_IMPLEMENTED = 'APP_IOC_NOT_IMPLEMENTED';

/**
 * 本地未找到 user token
 */
export const LOCAL_NO_USER_TOKEN = 'LOCAL_NO_USER_TOKEN';

/**
 * 全局未找到 window
 */
export const GLOBAL_NO_WINDOW = 'GLOBAL_NO_WINDOW';

/**
 * 必须在 PageProvider 中使用
 */
export const WITHIN_PAGE_PROVIDER = 'WITHIN_PAGE_PROVIDER';
