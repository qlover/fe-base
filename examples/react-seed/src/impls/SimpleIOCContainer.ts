/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IOCContainerInterface } from '@qlover/corekit-bridge/ioc';

// 定义元数据键
const INJECTABLE_KEY = Symbol('injectable');
const INJECT_KEY = Symbol('inject');
const PARAM_TYPES_KEY = 'design:paramtypes';

// 装饰器
export function injectable() {
  return function (target: any) {
    // 标记类为可注入
    Reflect.defineMetadata(INJECTABLE_KEY, true, target);
    // 保存原始构造函数参数类型
    const paramTypes = Reflect.getMetadata(PARAM_TYPES_KEY, target) || [];
    Reflect.defineMetadata(PARAM_TYPES_KEY, paramTypes, target);
    return target;
  };
}

export function inject(serviceIdentifier: any) {
  return function (
    target: any,
    propertyKey: string | symbol,
    parameterIndex: number
  ) {
    // 获取已存在的注入配置
    const existingInjections = Reflect.getMetadata(INJECT_KEY, target) || [];

    // 存储注入配置：参数索引 -> 服务标识符
    existingInjections[parameterIndex] = serviceIdentifier;

    // 更新元数据
    Reflect.defineMetadata(INJECT_KEY, existingInjections, target);

    return target;
  };
}

// IOC容器实现
export class SimpleIOCContainer implements IOCContainerInterface {
  private bindings = new Map<unknown, any>();
  private instances = new Map<unknown, any>();

  /**
   * 绑定服务

   * @override
      */
  bind<T>(serviceIdentifier: unknown, value: T): void {
    // 检查 value 是否为类（构造器）
    if (typeof value === 'function' && value.prototype) {
      // 检查是否标记为 @injectable
      const isInjectable = Reflect.getMetadata(INJECTABLE_KEY, value);
      if (!isInjectable) {
        console.warn(
          `Class ${value.name} is not decorated with @injectable. It may not be properly injected.`
        );
      }
    }

    this.bindings.set(serviceIdentifier, value);
  }

  /**
   * 获取服务实例

   * @override
      */
  get<T>(serviceIdentifier: unknown): T {
    // 先从实例缓存中查找
    if (this.instances.has(serviceIdentifier)) {
      return this.instances.get(serviceIdentifier);
    }

    // 获取绑定
    const binding = this.bindings.get(serviceIdentifier);

    if (!binding) {
      throw new Error(`No binding found for ${String(serviceIdentifier)}`);
    }

    // 如果是类（构造器），则创建实例
    if (typeof binding === 'function' && binding.prototype) {
      const instance = this.instantiate(binding);

      // 如果是单例模式，则缓存实例
      if (this.isSingleton(binding)) {
        this.instances.set(serviceIdentifier, instance);
      }

      return instance as T;
    }

    // 如果不是类，直接返回值（可能是常量、工厂函数结果等）
    return binding;
  }

  /**
   * 实例化类
   */
  private instantiate<T>(constructor: new (...args: any[]) => T): T {
    // 获取构造函数参数类型
    const paramTypes = Reflect.getMetadata(PARAM_TYPES_KEY, constructor) || [];

    // 获取 @inject 装饰器指定的参数
    const injectMetadata = Reflect.getMetadata(INJECT_KEY, constructor) || [];

    // 准备参数
    const args = paramTypes.map((paramType: any, index: number) => {
      // 优先使用 @inject 指定的标识符
      const serviceIdentifier = injectMetadata[index] || paramType;

      if (!serviceIdentifier) {
        throw new Error(
          `Cannot resolve parameter at index ${index} for ${constructor.name}`
        );
      }

      // 递归解析依赖
      return this.get(serviceIdentifier);
    });

    // 创建实例
    return new constructor(...args);
  }

  /**
   * 检查是否为单例（简单实现：标记为 @injectable 的类默认单例）
   */
  private isSingleton(target: any): boolean {
    return Reflect.getMetadata(INJECTABLE_KEY, target) === true;
  }

  /**
   * 重置容器（主要用于测试）
   */
  reset(): void {
    this.bindings.clear();
    this.instances.clear();
  }
}
