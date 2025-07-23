/**
 * @module example/ExampleTypeArgs
 *
 * this ExampleTypeArgs file
 */
export type ConstructorArgs = {
  mode?: string;
  isAdmin?: boolean;
  roles?: string[];
  id: number;
};

/**
 * 这是一个示例类型，用于测试类型参数
 *
 * 比如方法参数是一个 type，interface, Partial<T>，Record<K, V>，Set<T>，Map<K, V>，等等
 *
 * 这些类型参数都会被解析为 markdown 文档
 */
export function ExampleTypeArgsFunction(name: string, args: ConstructorArgs) {
  return new ExampleTypeArgsClass(name, args);
}

/**
 * 这是一个示例类，用于测试类型参数
 *
 * 比如方法参数是一个 type，interface, Partial<T>，Record<K, V>，Set<T>，Map<K, V>，等等
 *
 * 这些类型参数都会被解析为 markdown 文档
 */
export class ExampleTypeArgsClass {
  constructor(
    public name: string,
    /**
     * @see {ConstructorArgs}
     */
    public args: ConstructorArgs
  ) {}
}

/**
 * 这是一个示例类，用于测试类型参数
 *
 * 比如方法参数是一个 type，interface, Partial<T>，Record<K, V>，Set<T>，Map<K, V>，等等
 *
 * 这些类型参数都会被解析为 markdown 文档
 */
export class ExampleTypeArgsGenericsClass<T> {
  constructor(
    public name: string,
    public args: T
  ) {}
}

/**
 * 这是一个示例类，用于测试类型参数
 *
 * 比如方法参数是一个 type，interface, Partial<T>，Record<K, V>，Set<T>，Map<K, V>，等等
 *
 * 这些类型参数都会被解析为 markdown 文档
 */
export class ExampleTypeArgsGenericsClass2<T extends ConstructorArgs> {
  constructor(
    public name2: string | string[],
    public args2: T
  ) {}
}
