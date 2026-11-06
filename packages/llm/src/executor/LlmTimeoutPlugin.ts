import type {
  ExecutorContextInterface,
  LifecyclePluginInterface
} from '@qlover/fe-corekit';
import type { LlmExecutorParamsType } from './LlmExecutorParams';
import { createTimeoutSignal, mergeAbortSignals } from './mergeAbortSignals';

/**
 * 在 onBefore 合并外部 signal 与超时 signal。
 */
export class LlmTimeoutPlugin
  implements
    LifecyclePluginInterface<
      ExecutorContextInterface<LlmExecutorParamsType, unknown>
    >
{
  public readonly pluginName = 'LlmTimeoutPlugin';
  public readonly onlyOne = true;

  /**
   * @override
   */
  public onBefore(
    ctx: ExecutorContextInterface<LlmExecutorParamsType, unknown>
  ): LlmExecutorParamsType {
    const params = ctx.parameters ?? {};
    const timeoutMs = params.timeoutMs;
    const signals: AbortSignal[] = [];
    if (params.signal) {
      signals.push(params.signal);
    }
    if (typeof timeoutMs === 'number' && timeoutMs > 0) {
      signals.push(createTimeoutSignal(timeoutMs));
    }
    if (signals.length === 0) {
      return params;
    }
    return {
      ...params,
      signal: mergeAbortSignals(signals)
    };
  }
}
