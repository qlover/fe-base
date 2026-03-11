import type { LoggerInterface } from '@qlover/logger';
import {
  SimpleIOCContainer,
  type ConstructorParameterMetadata,
  type Newable,
  type PropertyInjectMetadata,
  type ServiceIdentifier
} from './SimpleIOCContainer';

const INJECTABLE_KEY = Symbol('injectable');
const INJECT_KEY = Symbol('inject');
const PROPERTY_INJECT_KEY = Symbol('property_inject');
const PARAM_TYPES_KEY = 'design:paramtypes';

const REFLECT_METADATA_ERROR =
  'ReflectionIOCContainer requires "reflect-metadata". ' +
  'Install it (e.g. pnpm add reflect-metadata) and add import "reflect-metadata" at your app entry (e.g. main.tsx or _app.tsx) before any other imports.';

interface ReflectMetadata {
  getMetadata(key: unknown, target: object): unknown;
  defineMetadata(key: unknown, value: unknown, target: object): void;
}

function ensureReflectMetadata(): void {
  const R = Reflect as unknown as ReflectMetadata;
  if (
    typeof Reflect !== 'object' ||
    typeof R.getMetadata !== 'function' ||
    typeof R.defineMetadata !== 'function'
  ) {
    throw new Error(REFLECT_METADATA_ERROR);
  }
}

function getReflect(): ReflectMetadata {
  ensureReflectMetadata();
  return Reflect as unknown as ReflectMetadata;
}

/**
 * Class decorator for injectable services (optional; used with @inject for constructor params).
 */
export function injectable(): ClassDecorator {
  return function <T extends Newable>(target: T): T {
    getReflect().defineMetadata(INJECTABLE_KEY, true, target);
    return target;
  } as ClassDecorator;
}

/**
 * Supports both constructor parameter injection and property injection.
 * - Constructor: @inject(Id) param: Type
 * - Property: @inject(Id) protected prop!: Type
 */
export function inject(serviceIdentifier: ServiceIdentifier) {
  return function (
    target: object,
    propertyKey: string | symbol | undefined,
    parameterIndex?: number
  ): void {
    const R = getReflect();
    if (parameterIndex === undefined && propertyKey !== undefined) {
      const existing: PropertyInjectMetadata =
        (R.getMetadata(
          PROPERTY_INJECT_KEY,
          target
        ) as PropertyInjectMetadata) || {};
      existing[propertyKey] = serviceIdentifier;
      R.defineMetadata(PROPERTY_INJECT_KEY, existing, target);
      return;
    }
    if (propertyKey !== undefined) {
      throw new Error(
        `@inject can only be used on constructor parameters or class properties. ` +
          `Unexpected usage on ${String(propertyKey)}.`
      );
    }
    const existingInjections: ConstructorParameterMetadata =
      (R.getMetadata(INJECT_KEY, target) as ConstructorParameterMetadata) || {};
    existingInjections[parameterIndex as number] = serviceIdentifier;
    R.defineMetadata(INJECT_KEY, existingInjections, target);
  };
}

/**
 * IOC container with @inject / @injectable and reflect-metadata support.
 * Requires "reflect-metadata" to be installed and imported once (e.g. in app entry).
 */
export class ReflectionIOCContainer extends SimpleIOCContainer {
  constructor(logger?: LoggerInterface) {
    ensureReflectMetadata();
    super(logger);
  }

  protected override instantiate<T>(constructor: Newable<T>): T {
    const R = getReflect();
    const injectMetadata: ConstructorParameterMetadata =
      (R.getMetadata(
        INJECT_KEY,
        constructor
      ) as ConstructorParameterMetadata) || {};

    let instance: T;
    if (Object.keys(injectMetadata).length > 0) {
      const args = this.resolveInjectedDependencies(
        constructor,
        injectMetadata
      );
      instance = new constructor(...args);
    } else if (constructor.length === 0) {
      instance = new constructor();
    } else {
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
        this.logger?.warn?.(
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

  private getParamTypes(constructor: Newable): unknown[] {
    try {
      return (
        (getReflect().getMetadata(PARAM_TYPES_KEY, constructor) as unknown[]) ||
        []
      );
    } catch {
      return [];
    }
  }

  private resolveInjectedDependencies(
    constructor: Newable,
    injectMetadata: ConstructorParameterMetadata
  ): unknown[] {
    const paramCount = constructor.length;
    const args: unknown[] = new Array(paramCount);
    for (let i = 0; i < paramCount; i++) {
      const serviceIdentifier = injectMetadata[i];
      if (!serviceIdentifier) {
        if (i >= constructor.length) {
          args[i] = undefined;
          continue;
        }
        throw new Error(
          `Cannot resolve parameter at index ${i} for ${constructor.name}. No @inject decorator found.`
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
      if (!this.isConstructorParam(paramType)) {
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

  private isConstructorParam(value: unknown): value is Newable {
    return (
      typeof value === 'function' &&
      value !== null &&
      (value as Newable).prototype != null &&
      (value as Newable).prototype.constructor === value
    );
  }

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

  private getPropertyInjectMetadata(
    constructor: Newable
  ): PropertyInjectMetadata {
    const merged: PropertyInjectMetadata = {};
    let proto: object | null = constructor.prototype;
    while (proto !== null && proto !== Object.prototype) {
      const meta: PropertyInjectMetadata | undefined = getReflect().getMetadata(
        PROPERTY_INJECT_KEY,
        proto
      ) as PropertyInjectMetadata | undefined;
      if (meta) {
        Object.assign(merged, meta);
      }
      proto = Object.getPrototypeOf(proto);
    }
    return merged;
  }
}
