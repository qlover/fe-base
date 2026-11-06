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
import {
  defaultLlmShouldRetry,
  type LlmRetryPluginOptionsType
} from './LlmRetryPlugin';
import { LlmTimeoutPlugin } from './LlmTimeoutPlugin';
import { createTimeoutSignal, mergeAbortSignals } from './mergeAbortSignals';
import { unwrapExecutorError } from './unwrapExecutorError';

/**
 * 可挂到 LifecycleExecutor 的插件（放宽泛型，避免 Ctx 绑定过死）。
 */
export type LlmLifecyclePluginType = {
  readonly pluginName?: string;
  readonly onlyOne?: boolean;
  // hooks 由 fe-corekit 在运行时调用
  readonly onBefore?: (...args: never[]) => unknown;
  readonly onExec?: (...args: never[]) => unknown;
  readonly onSuccess?: (...args: never[]) => unknown;
  readonly onError?: (...args: never[]) => unknown;
  readonly onFinally?: (...args: never[]) => unknown;
};

export type CreateLlmExecutorOptionsType = {
  readonly agent: LlmAgentInterface;
  /** 默认超时；单次调用可覆盖。 */
  readonly timeoutMs?: number;
  /**
   * 重试配置。传 `false` 关闭。
   * 仅作用于 {@link LlmExecutor.completions}；流式默认不重试。
   */
  readonly retry?: LlmRetryPluginOptionsType | false;
  /** 额外 Lifecycle 插件（在 Timeout 之后注册）。 */
  readonly plugins?: readonly LlmLifecyclePluginType[];
};

/**
 * 基于 LifecycleExecutor 的 LLM 调用门面：超时、中止、completions 重试。
 *
 * - Timeout：`LlmTimeoutPlugin`（onBefore 合并 signal）
 * - Retry：在门面内循环（不依赖 onExec 包装，避免半截/漏包装）
 * - 流式：仅超时/中止，不重试
 */
export class LlmExecutor {
  protected readonly agent: LlmAgentInterface;
  protected readonly defaultTimeoutMs: number | undefined;
  protected readonly retryOptions: LlmRetryPluginOptionsType | false;
  protected readonly completionsExecutor: LifecycleExecutor;

  constructor(options: CreateLlmExecutorOptionsType) {
    this.agent = options.agent;
    this.defaultTimeoutMs = options.timeoutMs;
    this.retryOptions = options.retry === undefined ? {} : options.retry;

    this.completionsExecutor = new LifecycleExecutor();
    this.completionsExecutor.use(
      new LlmTimeoutPlugin() as unknown as Parameters<
        LifecycleExecutor['use']
      >[0]
    );
    for (const plugin of options.plugins ?? []) {
      this.completionsExecutor.use(
        plugin as unknown as Parameters<LifecycleExecutor['use']>[0]
      );
    }
  }

  /**
   * 非流式补全（可超时 + 重试）。
   */
  public async completions(
    messages: readonly LlmChatMessageType[],
    params?: LlmCompletionsParamsType,
    options?: {
      readonly signal?: AbortSignal;
      readonly timeoutMs?: number;
    }
  ): Promise<LlmChatCompletionType> {
    const maxRetries =
      this.retryOptions === false
        ? 1
        : Math.max(1, this.retryOptions.maxRetries ?? 3);
    const retryDelayMs =
      this.retryOptions === false
        ? 0
        : Math.max(0, this.retryOptions.retryDelayMs ?? 1000);
    const shouldRetry =
      this.retryOptions === false
        ? (): boolean => false
        : (this.retryOptions.shouldRetry ?? defaultLlmShouldRetry);

    let attempt = 0;
    let lastError: unknown;
    while (attempt < maxRetries) {
      attempt += 1;
      const taskParams: LlmExecutorParamsType = {
        signal: options?.signal,
        timeoutMs: options?.timeoutMs ?? this.defaultTimeoutMs
      };
      try {
        return await this.completionsExecutor.exec(
          taskParams,
          async (ctx) =>
            this.agent.completions(messages, params, {
              signal: (ctx.parameters as LlmExecutorParamsType).signal
            })
        );
      } catch (error: unknown) {
        const raw = unwrapExecutorError(error);
        lastError = raw;
        const canRetry = attempt < maxRetries && shouldRetry(raw);
        if (!canRetry) {
          throw raw;
        }
        if (retryDelayMs > 0) {
          await new Promise<void>((resolve) => {
            setTimeout(resolve, retryDelayMs);
          });
        }
      }
    }
    throw lastError;
  }

  /**
   * 流式分片：支持超时/中止，**默认不重试**。
   */
  public async *streamChatParts(
    messages: readonly LlmChatMessageType[],
    options?: LlmStreamChatOptionsType
  ): AsyncGenerator<LlmChatStreamPartType, void, void> {
    const signal = this.resolveStreamSignal(options);
    yield* this.agent.streamChatParts(messages, {
      ...options,
      signal
    });
  }

  /**
   * 流式正文：同上。
   */
  public async *streamChatText(
    messages: readonly LlmChatMessageType[],
    options?: LlmStreamChatOptionsType
  ): AsyncGenerator<string, void, void> {
    const signal = this.resolveStreamSignal(options);
    yield* this.agent.streamChatText(messages, {
      ...options,
      signal
    });
  }

  /**
   * 暴露底层 LifecycleExecutor，便于挂自定义插件。
   */
  public getCompletionsExecutor(): LifecycleExecutor {
    return this.completionsExecutor;
  }

  protected resolveStreamSignal(
    options?: LlmStreamChatOptionsType
  ): AbortSignal | undefined {
    const timeoutMs = options?.timeoutMs ?? this.defaultTimeoutMs;
    const signals: AbortSignal[] = [];
    if (options?.signal) {
      signals.push(options.signal);
    }
    if (typeof timeoutMs === 'number' && timeoutMs > 0) {
      signals.push(createTimeoutSignal(timeoutMs));
    }
    if (signals.length === 0) {
      return undefined;
    }
    return mergeAbortSignals(signals);
  }
}

/**
 * 工厂：创建带 Lifecycle 插件的 LLM Executor。
 */
export function createLlmExecutor(
  options: CreateLlmExecutorOptionsType
): LlmExecutor {
  return new LlmExecutor(options);
}
