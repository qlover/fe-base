import type { EnvSourceInterface } from '@shared/env/EnvSourceInterface';

/**
 * `process.env` 适配器。
 *
 * 本地 dotenv / Next 插件写入进程后，从此处惰性读。
 * 作为解封袋的回落源，袋里没有的键仍读进程。
 */
export class ProcessEnvSource implements EnvSourceInterface {
  public static readonly INSTANCE: ProcessEnvSource = new ProcessEnvSource();

  /**
   * @override
   */
  public get(key: string): string | undefined {
    return process.env[key];
  }

  /**
   * @override
   */
  public has(key: string): boolean {
    return Object.prototype.hasOwnProperty.call(process.env, key);
  }
}
