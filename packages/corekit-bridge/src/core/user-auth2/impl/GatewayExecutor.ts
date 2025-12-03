import {
  AsyncExecutor,
  ExecutorContext,
  PromiseTask
} from '@qlover/fe-corekit';
import { firstUppercase } from '../utils';
import { AsyncStore } from '../../store-state';
import { LoggerInterface } from '@qlover/logger';

/**
 * GatewayExecutorOptions is the options for the GatewayExecutor
 *
 * - Except for the params property, other properties are read-only and cannot be modified
 */
export interface GatewayExecutorOptions<Params, T, Gateway>
  extends Readonly<GatewayExecutorBaseOptions<T, Gateway, string>> {
  /**
   * Action name
   *
   * - Do not allow to modify actionName, this is to ensure the stability of the executor
   *
   */
  readonly actionName: string;

  /**
   * Service name
   */
  readonly serviceName: string;

  /**
   * Parameters for executing gateway method
   *
   */
  params: Params;
}

export interface GatewayExecutorBaseOptions<T, Gateway, Key = string> {
  /**
   * Store instance for the service
   *
   * @default `AsyncStore<T, string>`
   */
  store?: AsyncStore<T, Key>;

  /**
   * Gateway instance for the service
   * @default `null`
   */
  gateway?: Gateway | null;

  /**
   * Logger instance for the service
   *
   * - Future use logger to record the log of service execution
   *
   * @default `null`
   */
  logger?: LoggerInterface;
}

/**
 * GatewayExecutor for executing gateway actions with plugin support
 *
 * - Allow plugins to execute [action][before|success] hook logic
 * - Plugins can define hooks like: onLoginBefore, onLoginSuccess
 * - Error handling is done through Executor's onError hook, users can define on[Action]Error hooks manually
 *
 *
 * 扩展了AsyncExecutor，增加了[action][before|success] hook的支持
 *
 * 比如需要在执行 action=login 之前的hook你可以有两种方式:
 *
 * 1. 使用 use 方法注册 plugin, 在 onBefore 单独判断 action=login 的情况
 *
 * @example
 * ```typescript
 * this.use({
 *   onBefore: (context) => {
 *    if (context.parameters.actionName === 'login') {
 *      // onLoginBefore hook logic
 *    }
 *   }
 * });
 * ```
 * 2. 直接使用颗粒度小的 onLoginBefore 中执行 hook 逻辑
 *
 * @example
 * ```typescript
 * this.use({
 *   onLoginBefore: (context) => {
 *    // onLoginBefore hook logic
 *   }
 * });
 * ```
 *
 * 但是，如果同时存在 onBefore 和 onLoginBefore 两个 hook 都会被执行，onBefore 在 onLoginBefore 之前执行
 *
 * 如果有多个 action 且before都需要被执行，你可以这样做:
 *
 * @example action=['login', 'logout']
 * ```typescript
 * this.use({
 *   onBefore: (context) => {
 *    if (context.parameters.actionName === 'login') {
 *      // onLoginBefore hook logic
 *    }
 *
 *    if (context.parameters.actionName === 'logout') {
 *      // onLogoutBefore hook logic
 *    }
 *   }
 * });
 *
 * // 或者使用颗粒度小的 onLoginBefore 和 onLogoutBefore 中执行 hook 逻辑
 * this.use({
 *   onLoginBefore: (context) => {
 *    // onLoginBefore hook logic
 *   },
 *   onLogoutBefore: (context) => {
 *    // onLogoutBefore hook logic
 *   }
 * });
 * ```
 *
 * 当发生错误的时候, 没有提供对应的 [action][error] hook, 这是为了考虑错误处理机制处理的统一性问题，
 * 因为整个 AsyncExecutor 的错误是统一由 catch 捕获并交由 onError 处理，我们不去修改它正常的捕获流程避免增加复杂度
 *
 * 如果需要针对特定 action 的错误处理, 可以在 onError hook 中处理
 *
 * @example
 * ```typescript
 * this.use({
 *   onError: (context) => {
 *    // onError hook logic
 *
 *    if (context.parameters.actionName === 'login') {
 *      // onLoginError hook logic
 *    }
 *    if (context.parameters.actionName === 'logout') {
 *      // onLogoutError hook logic
 *    }
 *   }
 * });
 */
export class GatewayExecutor<T, Gateway> extends AsyncExecutor {
  getHookName(action: string, type: 'before' | 'success'): string {
    return `on${firstUppercase(String(action))}${firstUppercase(type)}`;
  }

  /**
   * Execute the actual task and return the result
   *
   * - Do not allow to modify onExec hook logic, only execute gateway method
   *
   * @example Do not allow to modify onExec hook logic
   * ```typescript
   * const executor = new GatewayExecutor();
   * executor.use(new Plugin({
   *   onExec: async (context) => {
   *     return await context.actualTask(context);
   *   }
   * }));
   *
   * executor.exec(options, async (context) => {
   *  // do something ...
   *  // But onExec hook not be executed
   * });
   * ```
   *
   * @param context - The context of the executor
   * @param actualTask - The actual task to execute
   * @returns The result of the task
   */
  protected override async runExec<Result, Params = unknown>(
    context: ExecutorContext<Params>,
    actualTask: PromiseTask<Result, Params>
  ): Promise<void> {
    // Execute the actual task and return the result
    // don't use execHook to execute the task
    context.returnValue = await actualTask(context);
  }

  async runBeforeAction<Params = unknown>(
    context: ExecutorContext<GatewayExecutorOptions<Params, T, Gateway>>
  ): Promise<void> {
    await this.runHook(
      this.plugins,
      this.getHookName(context.parameters.actionName, 'before'),
      context
    );
  }

  async runSuccessAction<Params = unknown>(
    context: ExecutorContext<GatewayExecutorOptions<Params, T, Gateway>>
  ): Promise<void> {
    await this.runHook(
      this.plugins,
      this.getHookName(context.parameters.actionName, 'success'),
      context
    );
  }
}
