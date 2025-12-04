import {
  ExecutorContext,
  ExecutorError,
  ExecutorPlugin
} from '@qlover/fe-corekit';
import { GatewayExecutorOptions } from './GatewayExecutor';
import { FirstUppercaseType } from '../utils';

/**
 * Generate hook name type for a specific action
 * e.g., 'login' -> 'onLoginBefore' | 'onLoginSuccess'
 */
type ActionHookName<Action extends string> =
  | `on${FirstUppercaseType<Action>}Before`
  | `on${FirstUppercaseType<Action>}Success`;

/**
 * Generate hook name types for multiple actions
 * e.g., ['login', 'logout'] -> 'onLoginBefore' | 'onLoginSuccess' | 'onLogoutBefore' | 'onLogoutSuccess' | ...
 */
type ActionHookNames<Actions extends readonly string[]> = {
  [K in keyof Actions]: Actions[K] extends string
    ? ActionHookName<Actions[K]>
    : never;
}[number];

/**
 * Action-specific hooks type
 * Generates hook methods for single or multiple actions
 *
 * @example
 * ```typescript
 * type UserPlugin = GatewayActionHooksType<['login', 'logout'], unknown, unknown, any>;
 *
 * UserPlugin['onLoginBefore']
 * UserPlugin['onLoginSuccess']
 *
 * UserPlugin['onLogoutBefore']
 * UserPlugin['onLogoutSuccess']
 * ```
 */
export type GatewayBasePluginType<
  Action extends string | readonly string[],
  Params,
  T,
  Gateway
> = Action extends readonly string[]
  ? Partial<{
      [K in ActionHookNames<Action>]: (
        context: ExecutorContext<GatewayExecutorOptions<Params, T, Gateway>>
      ) => Promise<void> | void;
    }>
  : Action extends string
    ? Partial<{
        [K in ActionHookName<Action>]: (
          context: ExecutorContext<GatewayExecutorOptions<Params, T, Gateway>>
        ) => Promise<void> | void;
      }>
    : never;

/**
 * Base plugin for gateway actions
 *
 * 这是一个最基本的网关服务插件，它只提供了最基本的网关服务插件功能
 *
 * - onBefore: 在执行 action 之前执行将store置为开始
 * - onSuccess: 在执行 action 成功之后执行将store置为成功
 * - onError: 在执行 action 失败之后执行将store置为失败
 *
 * 如果需要扩展功能你可以渲染继承它或者单独实现
 *
 * @example 扩展插件
 *
 * ```typescript
 * class MyGatewayPlugin extends GatewayBasePlguin<Params, T, Gateway> {
 *   readonly pluginName = 'MyGatewayPlugin';
 *
 *   async onBefore(
 *     context: ExecutorContext<GatewayExecutorOptions<Params, T, Gateway>>
 *   ): Promise<void> {
 *
 *     // your code here
 *   }
 * }
 * ```
 *
 * @example 单独实现插件
 *
 * ```typescript
 * class MyGatewayPlugin implements ExecutorPlugin<GatewayExecutorOptions<Params, T, Gateway>> {
 *   readonly pluginName = 'MyGatewayPlugin';
 *
 *   async onBefore(
 *     context: ExecutorContext<GatewayExecutorOptions<Params, T, Gateway>>
 *   ): Promise<void> {
 *     // your code here
 *   }
 *
 *   async onSuccess(
 *     context: ExecutorContext<GatewayExecutorOptions<Params, T, Gateway>>
 *   ): Promise<void> {
 *     // your code here
 *   }
 *
 *   async onError(
 *     context: ExecutorContext<GatewayExecutorOptions<Params, T, Gateway>>
 *   ): Promise<void> {
 *     // your code here
 *   }
 * }
 * ```
 */
export class GatewayBasePlguin<Params, T, Gateway>
  implements ExecutorPlugin<GatewayExecutorOptions<Params, T, Gateway>>
{
  readonly pluginName = 'GatewayBasePlguin';

  async onBefore(
    context: ExecutorContext<GatewayExecutorOptions<Params, T, Gateway>>
  ): Promise<void> {
    const store = context.parameters.store;

    store?.start();
  }

  async onSuccess(
    context: ExecutorContext<GatewayExecutorOptions<Params, T, Gateway>>
  ): Promise<void> {
    const { returnValue } = context;
    const { actionName, serviceName, logger, store } = context.parameters;

    if (returnValue == null) {
      throw new ExecutorError(
        'SERVICE_RESULT_NULL',
        `${serviceName}: ${String(actionName)} - Result is null`
      );
    }

    store?.success(returnValue as T);
    if (logger) {
      const ms = store?.getDuration();
      logger.debug(
        `${serviceName}: ${String(actionName)} - success(${ms}ms)`,
        returnValue
      );
    }
  }

  async onError(
    context: ExecutorContext<GatewayExecutorOptions<Params, T, Gateway>>
  ): Promise<void> {
    const error = context.error;
    const store = context.parameters.store;

    store?.failed(error);
  }
}
