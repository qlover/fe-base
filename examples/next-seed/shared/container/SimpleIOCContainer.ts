import 'reflect-metadata';
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
type ConstructorParameterMetadata = Record<number, ServiceIdentifier>;
type PropertyInjectMetadata = Record<string | symbol, ServiceIdentifier>;

// 定义元数据键
const INJECTABLE_KEY = Symbol('injectable');
const INJECT_KEY = Symbol('inject');
const PROPERTY_INJECT_KEY = Symbol('property_inject');
const PARAM_TYPES_KEY = 'design:paramtypes';

// 装饰器
export function injectable(): ClassDecorator {
  return function <T extends Newable>(target: T): T {
    Reflect.defineMetadata(INJECTABLE_KEY, true, target);
    return target;
  } as ClassDecorator;
}

/**
 * Supports both constructor parameter injection and property injection.
 * - Use on constructor params: @inject(Id) param: Type
 * - Use on class properties: @inject(Id) protected prop!: Type
 */
export function inject(serviceIdentifier: ServiceIdentifier) {
  return function (
    target: object,
    propertyKey: string | symbol | undefined,
    parameterIndex?: number
  ): void {
    // Property injection: propertyKey is set, parameterIndex is undefined (property decorator has 2 args)
    if (parameterIndex === undefined && propertyKey !== undefined) {
      const existing: PropertyInjectMetadata =
        Reflect.getMetadata(PROPERTY_INJECT_KEY, target) || {};
      existing[propertyKey] = serviceIdentifier;
      Reflect.defineMetadata(PROPERTY_INJECT_KEY, existing, target);
      return;
    }
    // Constructor parameter injection
    if (propertyKey !== undefined) {
      throw new Error(
        `@inject decorator can only be used on constructor parameters or class properties. ` +
          `Unexpected usage on ${String(propertyKey)}.`
      );
    }

    const existingInjections: ConstructorParameterMetadata =
      Reflect.getMetadata(INJECT_KEY, target) || {};

    existingInjections[parameterIndex as number] = serviceIdentifier;
    Reflect.defineMetadata(INJECT_KEY, existingInjections, target);
  };
}

// IOC容器实现
export class SimpleIOCContainer implements IOCContainerInterface {
  private bindings = new Map<ServiceIdentifier, unknown>();
  private instances = new Map<ServiceIdentifier, unknown>();
  private factories = new Map<ServiceIdentifier, Factory>();

  constructor(protected logger?: LoggerInterface) {}

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
      this.logger?.debug(
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
    // 检查是否有 @inject 装饰器
    const injectMetadata: ConstructorParameterMetadata =
      Reflect.getMetadata(INJECT_KEY, constructor) || {};

    let instance: T;
    if (Object.keys(injectMetadata).length > 0) {
      // 使用 @inject 装饰器的配置
      const args = this.resolveInjectedDependencies(
        constructor,
        injectMetadata
      );
      instance = new constructor(...args);
    } else if (constructor.length === 0) {
      instance = new constructor();
    } else {
      // 尝试使用设计时类型元数据自动解析
      try {
        const paramTypes = this.getParamTypes(constructor);
        if (
          paramTypes.length === 0 ||
          paramTypes.every((type) => type === undefined)
        ) {
          throw new Error('No parameter type information available');
        }

        const args = this.resolveParamTypeDependencies(constructor, paramTypes);
        instance = new constructor(...args);
      } catch (error) {
        this.logger?.warn(
          `Failed to auto-resolve dependencies for ${constructor.name}: ${error}. ` +
            `Consider using @injectable() and @inject() decorators.`
        );

        const args = this.getDefaultArguments(constructor);
        instance = new constructor(...args);
      }
    }

    this.applyPropertyInjections(instance, constructor);
    return instance;
  }

  /**
   * Collect property inject metadata from prototype chain and apply to instance.
   */
  private applyPropertyInjections<T>(
    instance: T,
    constructor: Newable<T>
  ): void {
    const propertyMetadata = this.getPropertyInjectMetadata(constructor);
    const keys = [
      ...Object.keys(propertyMetadata),
      ...Object.getOwnPropertySymbols(propertyMetadata)
    ];
    if (keys.length === 0) {
      return;
    }
    for (const propertyKey of keys) {
      const serviceIdentifier = propertyMetadata[propertyKey];
      try {
        (instance as Record<string | symbol, unknown>)[propertyKey] =
          this.get(serviceIdentifier);
      } catch (error) {
        throw new Error(
          `Cannot resolve property injection ${String(serviceIdentifier)} ` +
            `for property "${String(propertyKey)}" of ${constructor.name}: ${error}`
        );
      }
    }
  }

  /**
   * Get merged property inject metadata from constructor's prototype chain.
   */
  private getPropertyInjectMetadata(
    constructor: Newable
  ): PropertyInjectMetadata {
    const merged: PropertyInjectMetadata = {};
    let proto: object | null = constructor.prototype;
    while (proto !== null && proto !== Object.prototype) {
      const meta: PropertyInjectMetadata | undefined = Reflect.getMetadata(
        PROPERTY_INJECT_KEY,
        proto
      );
      if (meta) {
        Object.assign(merged, meta);
      }
      proto = Object.getPrototypeOf(proto);
    }
    return merged;
  }

  /**
   * 获取构造函数参数类型
   */
  private getParamTypes(constructor: Newable): unknown[] {
    try {
      return Reflect.getMetadata(PARAM_TYPES_KEY, constructor) || [];
    } catch {
      return [];
    }
  }

  /**
   * 解析使用 @inject 装饰器的依赖
   */
  private resolveInjectedDependencies(
    constructor: Newable,
    injectMetadata: ConstructorParameterMetadata
  ): unknown[] {
    const paramCount = constructor.length;
    const args: unknown[] = new Array(paramCount);

    for (let i = 0; i < paramCount; i++) {
      const serviceIdentifier = injectMetadata[i];
      if (!serviceIdentifier) {
        // 检查是否是可选的构造函数参数
        if (i >= constructor.length) {
          args[i] = undefined;
          continue;
        }

        throw new Error(
          `Cannot resolve parameter at index ${i} for ${constructor.name}. ` +
            `No @inject decorator found.`
        );
      }

      try {
        args[i] = this.get(serviceIdentifier);
      } catch (error) {
        throw new Error(
          `Cannot resolve dependency ${String(serviceIdentifier)} ` +
            `for parameter at index ${i} of ${constructor.name}: ${error}`
        );
      }
    }

    return args;
  }

  /**
   * 解析基于参数类型的依赖
   */
  private resolveParamTypeDependencies(
    constructor: Newable,
    paramTypes: unknown[]
  ): unknown[] {
    return paramTypes.map((paramType, index) => {
      if (!paramType) {
        if (index >= constructor.length) {
          return undefined;
        }
        throw new Error(
          `Cannot resolve parameter at index ${index} for ${constructor.name}: No type information`
        );
      }

      if (!this.isConstructor(paramType)) {
        throw new Error(
          `Parameter type at index ${index} for ${constructor.name} is not a constructor: ${String(paramType)}`
        );
      }

      try {
        return this.get(paramType);
      } catch (error) {
        throw new Error(
          `Cannot resolve dependency ${String(paramType)} ` +
            `for parameter at index ${index} of ${constructor.name}: ${error}`
        );
      }
    });
  }

  /**
   * 获取默认参数值
   */
  private getDefaultArguments(constructor: Newable): unknown[] {
    const paramCount = constructor.length;
    if (paramCount === 0) {
      return [];
    }

    this.logger?.warn(
      `Creating ${constructor.name} with ${paramCount} undefined arguments. ` +
        `This may cause runtime errors. Consider using dependency injection.`
    );

    return new Array(paramCount).fill(undefined);
  }

  /**
   * 检查是否为单例
   */
  private isSingleton(target: Newable): boolean {
    return Reflect.getMetadata(INJECTABLE_KEY, target) === true;
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
