/**
 * Lifecycle 任务参数：超时 / 中止 / 重试开关。
 */
export type LlmExecutorParamsType = {
  readonly signal?: AbortSignal;
  /** 超时毫秒；`<=0` 或未设则不启用超时。 */
  readonly timeoutMs?: number;
  /**
   * 是否对本任务启用重试。流式默认 false；completions 默认 true（若装配了 Retry 插件）。
   */
  readonly enableRetry?: boolean;
};
