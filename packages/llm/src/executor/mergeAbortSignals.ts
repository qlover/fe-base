/**
 * 合并多个 AbortSignal；任一 abort 则结果 abort。
 */
export function mergeAbortSignals(
  signals: readonly AbortSignal[]
): AbortSignal {
  const active = signals.filter((signal) => signal != null);
  if (active.length === 0) {
    return new AbortController().signal;
  }
  if (active.length === 1) {
    return active[0]!;
  }
  const anyFn = (
    AbortSignal as typeof AbortSignal & {
      any?: (input: readonly AbortSignal[]) => AbortSignal;
    }
  ).any;
  if (typeof anyFn === 'function') {
    return anyFn(active);
  }
  const controller = new AbortController();
  const onAbort = (signal: AbortSignal): void => {
    if (!controller.signal.aborted) {
      controller.abort(signal.reason);
    }
  };
  for (const signal of active) {
    if (signal.aborted) {
      onAbort(signal);
      return controller.signal;
    }
    signal.addEventListener('abort', () => onAbort(signal), { once: true });
  }
  return controller.signal;
}

/**
 * 创建超时 AbortSignal（优先 `AbortSignal.timeout`）。
 */
export function createTimeoutSignal(timeoutMs: number): AbortSignal {
  const timeoutFn = (
    AbortSignal as typeof AbortSignal & {
      timeout?: (ms: number) => AbortSignal;
    }
  ).timeout;
  if (typeof timeoutFn === 'function') {
    return timeoutFn(timeoutMs);
  }
  const controller = new AbortController();
  setTimeout(() => {
    controller.abort(new Error(`LLM request timed out after ${timeoutMs}ms`));
  }, timeoutMs);
  return controller.signal;
}
