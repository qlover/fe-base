import type { IOCContainerInterface } from '@qlover/corekit-bridge/ioc';
import type { LoggerInterface } from '@qlover/logger';

// 定义类型
type ServiceIdentifier<T = unknown> =
  | string
  | symbol
  | Newable<T>
  | Abstract<T>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Newable<T = unknown> = new (...args: any[]) => T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Abstract<T = unknown> = abstract new (...args: any[]) => T;
type Factory<T = unknown> = () => T;

// IOC容器实现
export class SimpleIOCContainer implements IOCContainerInterface {
  private bindings = new Map<ServiceIdentifier, unknown>();
  private instances = new Map<ServiceIdentifier, unknown>();
  private factories = new Map<ServiceIdentifier, Factory>();

  constructor(protected logger: LoggerInterface) {}

  /**
   * 绑定服务

   * @override
      */
  public bind<T>(
    serviceIdentifier: ServiceIdentifier,
    value: T | Newable<T>
  ): void {
    this.bindings.set(serviceIdentifier, value);
  }

  /**
   * 绑定工厂函数
   */
  public bindFactory<T>(
    serviceIdentifier: ServiceIdentifier,
    factory: Factory<T>
  ): void {
    this.factories.set(serviceIdentifier, factory);
  }

  /**
   * 获取服务实例

   * @override
      */
  public get<T>(serviceIdentifier: ServiceIdentifier<T>): T {
    // 从实例缓存中查找
    if (this.instances.has(serviceIdentifier)) {
      return this.instances.get(serviceIdentifier) as T;
    }

    // 检查工厂函数
    if (this.factories.has(serviceIdentifier)) {
      const factory = this.factories.get(serviceIdentifier) as Factory<T>;
      const instance = factory();
      this.instances.set(serviceIdentifier, instance);
      return instance;
    }

    // 获取绑定
    const binding = this.bindings.get(serviceIdentifier);

    if (binding !== undefined) {
      // 如果是类构造函数，则实例化
      if (this.isConstructor(binding)) {
        const instance = this.instantiate<T>(binding as Newable<T>);
        this.instances.set(serviceIdentifier, instance);
        return instance;
      }

      // 如果不是类，直接返回值
      return binding as T;
    }

    // 如果没有绑定，检查是否是类构造函数
    if (this.isConstructor(serviceIdentifier)) {
      this.logger.debug(
        `Auto-instantiating unbound class: ${serviceIdentifier.name}`
      );
      const instance = this.instantiate<T>(serviceIdentifier);
      this.instances.set(serviceIdentifier, instance);
      return instance;
    }

    throw new Error(`No binding found for ${String(serviceIdentifier)}`);
  }

  /**
   * 检查是否为类构造函数
   */
  private isConstructor(value: unknown): value is Newable {
    return (
      typeof value === 'function' &&
      value.prototype &&
      value.prototype.constructor === value
    );
  }

  /**
   * 实例化类
   */
  private instantiate<T>(constructor: Newable<T>): T {
    if (constructor.length === 0) {
      return new constructor();
    }

    const args = this.getDefaultArguments(constructor);
    return new constructor(...args);
  }

  /**
   * 获取默认参数值
   */
  private getDefaultArguments(constructor: Newable): unknown[] {
    const paramCount = constructor.length;
    if (paramCount === 0) {
      return [];
    }

    this.logger.warn(
      `Creating ${constructor.name} with ${paramCount} undefined arguments. This may cause runtime errors.`
    );

    return new Array(paramCount).fill(undefined);
  }

  /**
   * 重置容器（主要用于测试）
   */
  public reset(): void {
    this.bindings.clear();
    this.instances.clear();
    this.factories.clear();
  }
}
