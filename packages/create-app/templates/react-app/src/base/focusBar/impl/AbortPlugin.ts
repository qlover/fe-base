import {
  type ExecutorPlugin,
  type ExecutorContext,
  ExecutorError
} from '@qlover/fe-corekit';

export interface AbortPluginConfig {
  id?: string;
  requestId?: string;
  onAborted?<T extends AbortPluginConfig>(config: T): void;
  signal?: AbortSignal;
  /**
   * 超时时间，单位：毫秒
   * 如果设置，则会在超时后自动 abort
   */
  abortTimeout?: number;
}

export const ABORT_ERROR_ID = 'ABORT_ERROR';

/**
 * 配置提取器函数类型
 * 用于从 context.parameters 中提取 AbortPluginConfig
 */
export type AbortConfigExtractor<T = any> = (
  parameters: T
) => AbortPluginConfig;

/**
 * AbortPlugin 选项
 */
export interface AbortPluginOptions<T = any> {
  /**
   * 配置提取器
   * 用于从 context.parameters 中提取 AbortPluginConfig
   * 默认直接返回 parameters
   */
  getConfig?: AbortConfigExtractor<T>;
}

/**
 * 自定义 Abort 错误类
 * 提供更丰富的错误信息，包括 key 和是否超时
 */
export class AbortError extends ExecutorError {
  /**
   * 的唯一标识符
   */
  readonly abortId?: string;

  /**
   * 超时时间（毫秒），如果是超时导致的 abort 则有值
   */
  readonly timeout?: number;

  constructor(message: string, abortId?: string, timeout?: number) {
    super(ABORT_ERROR_ID, message);
    this.abortId = abortId;
    this.timeout = timeout;
  }

  /**
   * 判断是否为超时错误
   */
  isTimeout(): boolean {
    return this.timeout !== undefined && this.timeout > 0;
  }

  /**
   * 获取友好的错误描述
   */
  getDescription(): string {
    const parts: string[] = [];

    if (this.abortId) {
      parts.push(`Request: ${this.abortId}`);
    }

    if (this.isTimeout()) {
      parts.push(`Timeout: ${this.timeout}ms`);
    }

    return parts.length > 0
      ? `${this.message} (${parts.join(', ')})`
      : this.message;
  }
}

export class AbortPlugin<TParameters = AbortPluginConfig>
  implements ExecutorPlugin
{
  readonly pluginName = 'AbortPlugin';

  readonly onlyOne = true;

  protected controllers: Map<string, AbortController> = new Map();

  // 存储超时定时器，用于防止内存泄漏
  protected timeouts: Map<string, NodeJS.Timeout> = new Map();

  private requestCounter = 0;

  /**
   * 配置提取器函数
   * 用于从 context.parameters 中提取 AbortPluginConfig
   */
  private readonly getConfig: AbortConfigExtractor<TParameters>;

  constructor(options?: AbortPluginOptions<TParameters>) {
    // 默认配置提取器：直接返回 parameters
    this.getConfig =
      options?.getConfig ||
      ((parameters) => parameters as unknown as AbortPluginConfig);
  }

  /**
   * 判断错误是否为 abort 相关错误（静态方法，可独立使用）
   *
   * @param error - 要检查的错误对象
   * @returns 是否为 abort 错误
   *
   * @example
   * ```typescript
   * try {
   *   await fetch(url);
   * } catch (error) {
   *   if (AbortPlugin.isAbortError(error)) {
   *     console.log('请求被取消');
   *   }
   * }
   * ```
   */
  static isAbortError(error?: any): boolean {
    // Check if the error is our custom AbortError
    if (error instanceof AbortError) {
      return true;
    }

    // Check if the error is an ExecutorError with ABORT_ERROR_ID
    if (error?.id === ABORT_ERROR_ID) {
      return true;
    }

    // Check if the error is an instance of AbortError
    if (error instanceof Error && error.name === 'AbortError') {
      return true;
    }

    // Check for DOMException with abort-related message
    if (error instanceof DOMException && error.name === 'AbortError') {
      return true;
    }

    // Check for Event with auto trigger abort
    // use: signal.addEventListener('abort')
    if (error instanceof Event && error.type === 'abort') {
      return true;
    }

    // Add any additional conditions that signify an abort error
    // For example, custom error types or specific error codes

    return false;
  }

  protected generateRequestKey(config: AbortPluginConfig): string {
    // 优先使用 requestId 或 id，如果都没有则使用 controllers 的 size + 1
    const { requestId, id } = config;
    return requestId || id || `${this.pluginName}-${++this.requestCounter}`;
  }

  /**
   * 释放相关资源（controller 和 timeout）
   * @param config 配置对象或的唯一标识符
   */
  protected releaseRequest(config: AbortPluginConfig | string): void {
    const key =
      typeof config === 'string' ? config : this.generateRequestKey(config);

    // 删除 controller
    this.controllers.delete(key);

    // 清除超时定时器
    const timeoutId = this.timeouts.get(key);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeouts.delete(key);
    }
  }

  onBefore(context: ExecutorContext<any>): void {
    // 使用配置提取器获取配置
    const config = this.getConfig(context.parameters);
    const key = this.generateRequestKey(config);
    const { abortTimeout } = config;

    // abort previous request
    if (this.controllers.has(key)) {
      this.abort(key);
    }

    // Check if config already has a signal
    if (!config.signal) {
      const controller = new AbortController();
      this.controllers.set(key, controller);

      // extends config with abort signal
      config.signal = controller.signal;

      // 设置超时机制，防止内存泄漏
      if (abortTimeout && abortTimeout > 0) {
        const timeoutId = setTimeout(() => {
          const ctrl = this.controllers.get(key);
          if (ctrl) {
            ctrl.abort(
              new AbortError(
                'The operation was aborted due to timeout',
                key,
                abortTimeout
              )
            );
            this.releaseRequest(key);

            // 触发 onAbort 回调
            if (typeof config.onAborted === 'function') {
              config.onAborted({
                ...config,
                onAborted: undefined
              });
            }
          }
        }, abortTimeout);

        this.timeouts.set(key, timeoutId);
      }
    }
  }

  onSuccess({ parameters }: ExecutorContext<any>): void {
    // delete controller and clear timeout
    if (parameters) {
      const config = this.getConfig(parameters);
      const key = this.generateRequestKey(config);
      console.log('AbortPlugin onSuccess - releasing key:', key);
      this.releaseRequest(key);
    }
  }

  onError({ error, parameters }: ExecutorContext<any>): ExecutorError | void {
    if (!parameters) return;

    const config = this.getConfig(parameters);
    const key = this.generateRequestKey(config);

    // only handle plugin related error，other error should be handled by other plugins
    if (AbortPlugin.isAbortError(error)) {
      // controller may be deleted in .abort, this is will be undefined
      const controller = this.controllers.get(key);
      this.releaseRequest(key);

      // 如果 signal.reason 已经是 AbortError，直接返回
      const reason = controller?.signal.reason;
      if (reason instanceof AbortError) {
        return reason;
      }

      // 否则创建新的 AbortError
      return new AbortError(
        reason?.message || error?.message || 'The operation was aborted',
        key
      );
    } else {
      // 发生非 abort 错误时，也需要清理资源
      this.releaseRequest(key);
    }
  }

  abort(config: AbortPluginConfig | string): boolean {
    const key =
      typeof config === 'string' ? config : this.generateRequestKey(config);

    const controller = this.controllers.get(key);
    if (controller) {
      controller.abort(new AbortError('The operation was aborted', key));
      this.releaseRequest(key);

      if (
        typeof config !== 'string' &&
        typeof config.onAborted === 'function'
      ) {
        config.onAborted({
          ...config,
          onAborted: undefined
        });
      }
      return true;
    }

    console.log('AbortPlugin abort - controller not found!');
    return false;
  }

  abortAll(): void {
    this.controllers.forEach((controller, key) => {
      controller.abort(new AbortError('All operations were aborted', key));
    });
    this.controllers.clear();

    // 清除所有超时定时器
    this.timeouts.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.timeouts.clear();
  }

  /**
   * 创建一个 Promise，当 signal 被 abort 时会 reject
   * 返回 Promise 和清理函数，用于防止内存泄漏
   *
   * @private 内部使用
   */
  private createAbortPromise(signal: AbortSignal): {
    promise: Promise<never>;
    cleanup: () => void;
  } {
    let cleanup: () => void = () => {};

    const promise = new Promise<never>((_, reject) => {
      // 如果已经 aborted，立即 reject
      if (signal.aborted) {
        reject(signal.reason || new AbortError('The operation was aborted'));
        return;
      }

      // 监听 abort 事件
      const onAbort = () => {
        reject(signal.reason || new AbortError('The operation was aborted'));
      };

      signal.addEventListener('abort', onAbort);

      // 提供清理函数，用于移除事件监听器
      cleanup = () => {
        signal.removeEventListener('abort', onAbort);
      };
    });

    return { promise, cleanup };
  }

  /**
   * 用 Promise.race 包装异步操作，确保能响应 abort signal
   * 即使底层操作没有检查 signal，也能在 abort 时中断
   *
   * 这是一个防御性机制，用于应对 gateway 或其他异步操作不检查 signal 的情况
   *
   * @param promise - 要包装的 Promise
   * @param signal - AbortSignal，如果未提供则直接返回原 Promise
   * @returns 包装后的 Promise，会在 signal abort 时立即 reject
   *
   * @example
   * ```typescript
   * const signal = new AbortController().signal;
   * const result = await abortPlugin.raceWithAbort(
   *   fetch('/api/data'), // 即使 fetch 不检查 signal
   *   signal
   * );
   * ```
   */
  public raceWithAbort<T>(
    promise: Promise<T>,
    signal?: AbortSignal
  ): Promise<T> {
    if (!signal) {
      return promise;
    }

    const { promise: abortPromise, cleanup } = this.createAbortPromise(signal);

    // 使用 Promise.race 竞争，哪个先完成就用哪个
    return Promise.race([promise, abortPromise]).finally(() => {
      // 无论成功还是失败，都清理事件监听器，防止内存泄漏
      cleanup();
    });
  }
}
