import type { LocaleType } from '@config/i18n';
import type { UUIDType } from '@schemas/common';
import type { NextRequest } from 'next/server';

export interface ServerState {
  /**
   * 服务开始执行时间戳
   *
   * 由 reset 可重置后的时间
   */
  started: number;

  /**
   * 该 id 用于表示一个服务上下文开启的唯一id
   *
   * 可用于请求的唯一id
   *
   * 一般在初始化就觉得, 也可以在 reset 重置
   */
  uid: UUIDType;

  /**
   * 用于描述当次服务名称
   *
   * 一般可能是调用 api 的名字
   */
  name: string;

  event_type?: string;

  /**
   * 允许从内部决定状态码，而不是默认400
   *
   * 仅用于内存环境, 真实的返回会将属性去掉
   */
  httpStatus?: number;
  /**
   * 该属性如果存在, 最后结果会导致相应重定向
   */
  redirectUrl?: string | URL;
}

export type ServerContextResetParams = ServerState & {
  /**
   * 允许传入当前请求对象
   *
   */
  request?: NextRequest | Request;
};

/**
 * 该接口用来表示当前服务器环境中的状态
 *
 * 是整个服务在运行时的上下文数据
 *
 * 比如: 国际化，请求id等
 */
export interface ServerContextInterface {
  reset(params?: Partial<ServerContextResetParams>): Promise<void>;

  changeState(params?: Partial<ServerContextResetParams>): Promise<void>;

  /**
   * 获取当前服务环境语言
   *
   * - 如果没有cookie 保存则通过请求头 Accept-Language 获取
   * - 否则直接 i18n 配置默认语言
   */
  getLocale(): Promise<LocaleType>;

  /**
   * 用于获取当前上下文的状态
   *
   * @example 获取上下文开始时间
   * ```
   * serverContext.getState().started;
   * serverContext.getState('started');
   * ```
   */
  getState(): Readonly<ServerState>;
  getState<K extends keyof ServerState>(prop: K): ServerState[K];
}
