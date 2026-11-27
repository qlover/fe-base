/**
 * 环境键读取契约。
 *
 * 本地不依赖 `@pamenv/next`；与 PAM 解封袋同形，便于以后接袋。
 */
export interface EnvSourceInterface {
  get(key: string): string | undefined;
  has(key: string): boolean;
}
