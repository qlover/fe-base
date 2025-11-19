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

export class AbortPlugin implements ExecutorPlugin {
  readonly pluginName = 'AbortPlugin';

  readonly onlyOne = true;

  protected controllers: Map<string, AbortController> = new Map();

  // 存储超时定时器，用于防止内存泄漏
  protected timeouts: Map<string, NodeJS.Timeout> = new Map();

  private requestCounter = 0;

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

  onBefore(context: ExecutorContext<AbortPluginConfig>): void {
    const key = this.generateRequestKey(context.parameters);
    const { abortTimeout } = context.parameters;

    // abort previous request
    if (this.controllers.has(key)) {
      this.abort(context.parameters);
    }

    // Check if config already has a signal
    if (!context.parameters.signal) {
      const controller = new AbortController();
      this.controllers.set(key, controller);

      // extends config with abort signal
      context.parameters.signal = controller.signal;

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
            if (typeof context.parameters.onAborted === 'function') {
              context.parameters.onAborted({
                ...context.parameters,
                onAbort: undefined
              });
            }
          }
        }, abortTimeout);

        this.timeouts.set(key, timeoutId);
      }
    }
  }

  onSuccess({ parameters }: ExecutorContext<AbortPluginConfig>): void {
    // delete controller and clear timeout
    if (parameters) {
      const key = this.generateRequestKey(parameters);
      this.releaseRequest(key);
    }
  }

  onError({
    error,
    parameters
  }: ExecutorContext<AbortPluginConfig>): ExecutorError | void {
    // only handle plugin related error，other error should be handled by other plugins
    if (this.isSameAbortError(error)) {
      if (parameters) {
        // controller may be deleted in .abort, this is will be undefined
        const key = this.generateRequestKey(parameters);
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
      }
    } else {
      // 发生非 abort 错误时，也需要清理资源
      if (parameters) {
        const key = this.generateRequestKey(parameters);
        this.releaseRequest(key);
      }
    }
  }

  isSameAbortError(error?: Error): boolean {
    // Check if the error is our custom AbortError
    if (error instanceof AbortError) {
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
          onAbort: undefined
        });
      }
      return true;
    }

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
}
