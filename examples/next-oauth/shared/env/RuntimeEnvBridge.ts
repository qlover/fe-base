import type { EnvSourceInterface } from '@shared/env/EnvSourceInterface';
import { ProcessEnvSource } from './ProcessEnvSource';

/**
 * 进程内当前生效的环境源。
 *
 * `shared/supabase/server` 拿不到 `ServerConfig`，又不能在未写 `process.env` 时读到空值。
 * `ServerConfig.bindPamenvBag` 把组合源挂到这里。
 * 遗留模块用 `getRuntimeEnv`，和 config 读同一份。
 */
class RuntimeEnvBridge implements EnvSourceInterface {
  protected source: EnvSourceInterface = ProcessEnvSource.INSTANCE;

  /**
   * 换成袋加进程的组合源。
   */
  public bind(source: EnvSourceInterface): void {
    this.source = source;
  }

  /**
   * @override
   */
  public get(key: string): string | undefined {
    return this.source.get(key);
  }

  /**
   * @override
   */
  public has(key: string): boolean {
    return this.source.has(key);
  }
}

/** 与本次请求的 `ServerConfig` 同步。 */
export const runtimeEnvBridge: RuntimeEnvBridge = new RuntimeEnvBridge();

/**
 * 不能注入 config 的模块读环境键。
 */
export function getRuntimeEnv(key: string): string | undefined {
  return runtimeEnvBridge.get(key);
}
