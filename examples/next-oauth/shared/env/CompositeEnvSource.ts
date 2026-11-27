import type { EnvSourceInterface } from '@shared/env/EnvSourceInterface';

/**
 * 组合环境源：primary 有键就用它，否则读 fallback。
 *
 * 解封袋在前，`ProcessEnvSource` 在后。
 */
export class CompositeEnvSource implements EnvSourceInterface {
  /**
   * @param primary - 优先源，通常是解封袋
   * @param fallback - 回落源，通常是 `ProcessEnvSource`
   */
  public constructor(
    protected readonly primary: EnvSourceInterface,
    protected readonly fallback: EnvSourceInterface
  ) {}

  /**
   * @override
   */
  public get(key: string): string | undefined {
    if (this.primary.has(key)) {
      return this.primary.get(key);
    }
    return this.fallback.get(key);
  }

  /**
   * @override
   */
  public has(key: string): boolean {
    return this.primary.has(key) || this.fallback.has(key);
  }
}
