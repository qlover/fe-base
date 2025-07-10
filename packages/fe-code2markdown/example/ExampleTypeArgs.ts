export type ConstructorArgs = {
  mode?: string;
  isAdmin?: boolean;
  roles?: string[];
  id: number;
};

/**
 * 这是一个示例类，用于测试类型参数
 *
 * 比如方法参数是一个 type，interface, Partial<T>，Record<K, V>，Set<T>，Map<K, V>，等等
 *
 * 这些类型参数都会被解析为 markdown 文档
 */
export class ExampleTypeArgs {
  constructor(
    public name: string,
    public args: ConstructorArgs
  ) {}
}
