import type { IOCContainerInterface } from './IOCContainerInterface';
import type { LoggerInterface } from '@qlover/logger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Newable<T = unknown> = new (...args: any[]) => T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Abstract<T = unknown> = abstract new (...args: any[]) => T;
export type ServiceIdentifier<T = unknown> =
  | string
  | symbol
  | Newable<T>
  | Abstract<T>;
export type ConstructorParameterMetadata = Record<number, ServiceIdentifier>;
export type PropertyInjectMetadata = Record<string | symbol, ServiceIdentifier>;
type Factory<T = unknown> = () => T;

/**
 * Simple IOC container (no decorators, no reflect-metadata).
 * Use this when you only need manual bind/get or when you want to avoid reflect-metadata.
 *
 * For constructor injection with @inject / @injectable and optional property injection,
 * use ReflectionIOCContainer from the same module.
 */
export class SimpleIOCContainer implements IOCContainerInterface {
  private bindings = new Map<ServiceIdentifier, unknown>();
  private instances = new Map<ServiceIdentifier, unknown>();
  private factories = new Map<ServiceIdentifier, Factory>();

  constructor(protected logger?: LoggerInterface) {}

  /** @override */
  public bind<T>(
    serviceIdentifier: ServiceIdentifier,
    value: T | Newable<T>
  ): void {
    this.bindings.set(serviceIdentifier, value);
  }

  /**
   * Bind a factory; the container will call it once per get() and cache the result.
   */
  public bindFactory<T>(
    serviceIdentifier: ServiceIdentifier,
    factory: Factory<T>
  ): void {
    this.factories.set(serviceIdentifier, factory);
  }

  /** @override */
  public get<T>(serviceIdentifier: ServiceIdentifier<T>): T {
    if (this.instances.has(serviceIdentifier)) {
      return this.instances.get(serviceIdentifier) as T;
    }

    if (this.factories.has(serviceIdentifier)) {
      const factory = this.factories.get(serviceIdentifier) as Factory<T>;
      const instance = factory();
      this.instances.set(serviceIdentifier, instance);
      return instance;
    }

    const binding = this.bindings.get(serviceIdentifier);

    if (binding !== undefined) {
      if (this.isConstructor(binding)) {
        const instance = this.instantiate<T>(binding as Newable<T>);
        this.instances.set(serviceIdentifier, instance);
        return instance;
      }
      return binding as T;
    }

    if (this.isConstructor(serviceIdentifier)) {
      this.logger?.debug?.(
        `Auto-instantiating unbound class: ${(serviceIdentifier as Newable).name}`
      );
      const instance = this.instantiate<T>(serviceIdentifier as Newable<T>);
      this.instances.set(serviceIdentifier, instance);
      return instance;
    }

    throw new Error(`No binding found for ${String(serviceIdentifier)}`);
  }

  /**
   * Reset all bindings/instances/factories (mainly for tests).
   */
  public reset(): void {
    this.bindings.clear();
    this.instances.clear();
    this.factories.clear();
  }

  public isConstructor(value: unknown): value is Newable {
    return (
      typeof value === 'function' &&
      value !== null &&
      (value as Newable).prototype != null &&
      (value as Newable).prototype.constructor === value
    );
  }

  /**
   * Override in subclass to support @inject / design:paramtypes / property injection.
   */
  protected instantiate<T>(constructor: Newable<T>): T {
    if (constructor.length === 0) {
      return new constructor();
    }
    const args = this.getDefaultArguments(constructor);
    return new constructor(...args);
  }

  protected getDefaultArguments(constructor: Newable): unknown[] {
    const paramCount = constructor.length;
    if (paramCount === 0) {
      return [];
    }
    this.logger?.warn?.(
      `Creating ${constructor.name} with ${paramCount} undefined arguments. This may cause runtime errors.`
    );
    return new Array(paramCount).fill(undefined);
  }
}
