import { LifecycleExecutor } from '@qlover/fe-corekit';
import type { LlmAgentInterface } from '../interfaces/LlmAgentInterface';
import type {
  LlmChatCompletionType,
  LlmChatMessageType,
  LlmChatStreamPartType,
  LlmCompletionsParamsType,
  LlmStreamChatOptionsType
} from '../types/LlmTypes';
import type { LlmExecutorParamsType } from './LlmExecutorParams';
import { unwrapExecutorError } from './unwrapExecutorError';

/**
 * 可挂到 LifecycleExecutor 的插件（放宽泛型，避免 Ctx 绑定过死）。
 */
export type LlmLifecyclePluginType = {
  readonly pluginName?: string;
  readonly onlyOne?: boolean;
  readonly onBefore?: (...args: never[]) => unknown;
  readonly onExec?: (...args: never[]) => unknown;
  readonly onSuccess?: (...args: never[]) => unknown;
  readonly onError?: (...args: never[]) => unknown;
  readonly onFinally?: (...args: never[]) => unknown;
};

export type CreateLlmExecutorOptionsType = {
  readonly agent: LlmAgentInterface;
  /**
   * 创建时注册的插件（可选）。
   * 默认不挂任何策略；超时 / 重试请显式传入或事后 {@link LlmExecutor.use}。
   */
  readonly plugins?: readonly LlmLifecyclePluginType[];
};

type UsePluginType = Parameters<LifecycleExecutor['use']>[0];

/**
 * 薄 Lifecycle 门面：只负责把 Agent 调用丢进执行器。
 *
 * 策略由用户挂插件，例如：
 * ```ts
 * createLlmExecutor({ agent })
 *   .use(new LlmTimeoutPlugin())
 *   .use(new LlmRetryPlugin({ maxRetries: 3 }));
 * ```
 */
export class LlmExecutor {
  protected readonly agent: LlmAgentInterface;
  protected readonly lifecycle: LifecycleExecutor;

  constructor(options: CreateLlmExecutorOptionsType) {
    this.agent = options.agent;
    this.lifecycle = new LifecycleExecutor();
    for (const plugin of options.plugins ?? []) {
      this.use(plugin);
    }
  }

  /**
   * 注册 Lifecycle 插件（顺序敏感：Timeout 宜在 Retry 前）。
   */
  public use(plugin: LlmLifecyclePluginType): this {
    this.lifecycle.use(plugin as unknown as UsePluginType);
    return this;
  }

  /**
   * 非流式补全：参数进 context，策略完全由已注册插件决定。
   */
  public async completions(
    messages: readonly LlmChatMessageType[],
    params?: LlmCompletionsParamsType,
    options?: {
      readonly signal?: AbortSignal;
      readonly timeoutMs?: number;
      readonly enableRetry?: boolean;
    }
  ): Promise<LlmChatCompletionType> {
    const taskParams: LlmExecutorParamsType = {
      signal: options?.signal,
      timeoutMs: options?.timeoutMs,
      enableRetry: options?.enableRetry
    };
    try {
      return await this.lifecycle.exec(
        taskParams,
        async (ctx) =>
          this.agent.completions(messages, params, {
            signal: (ctx.parameters as LlmExecutorParamsType).signal
          })
      );
    } catch (error: unknown) {
      throw unwrapExecutorError(error);
    }
  }

  /**
   * 流式分片：不经 Lifecycle（避免半截流 + Retry）。
   * 超时请自行传 `signal`（可用 `createTimeoutSignal` / `mergeAbortSignals`）。
   */
  public async *streamChatParts(
    messages: readonly LlmChatMessageType[],
    options?: LlmStreamChatOptionsType
  ): AsyncGenerator<LlmChatStreamPartType, void, void> {
    yield* this.agent.streamChatParts(messages, options);
  }

  /**
   * 流式正文：同上。
   */
  public async *streamChatText(
    messages: readonly LlmChatMessageType[],
    options?: LlmStreamChatOptionsType
  ): AsyncGenerator<string, void, void> {
    yield* this.agent.streamChatText(messages, options);
  }

  /**
   * 底层 LifecycleExecutor。
   */
  public getLifecycleExecutor(): LifecycleExecutor {
    return this.lifecycle;
  }

  /**
   * @deprecated 使用 {@link getLifecycleExecutor}
   */
  public getCompletionsExecutor(): LifecycleExecutor {
    return this.lifecycle;
  }
}

/**
 * 工厂：创建空策略 Lifecycle 门面（插件由调用方装配）。
 */
export function createLlmExecutor(
  options: CreateLlmExecutorOptionsType
): LlmExecutor {
  return new LlmExecutor(options);
}
