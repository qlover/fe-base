import type { LocaleType } from '@config/i18n';
import type { NextRequest } from 'next/server';

/**
 * 该接口用来表示当前服务器环境中的状态
 *
 * 比如: 国际化，请求id等
 */
export interface ServerStateInterface {
  handler(request: NextRequest | Request): Promise<void>;

  reset(): void;

  /**
   * 获取当前服务环境语言
   *
   * - 如果没有cookie 保存则通过请求头 Accept-Language 获取
   * - 否则直接 i18n 配置默认语言
   */
  getLocale(): Promise<LocaleType>;
}
