import { Container } from 'inversify';
import type {
  IOCContainerInterface,
  ServiceIdentifier
} from '@qlover/corekit-bridge';
import { assertReflectMetadata } from './assertReflectMetadata';

/**
 * Inversify-backed IOC container.
 *
 * Apps pass their `IOCIdentifierMap` as the generic for typed `get(I.Xxx)`.
 * Requires `import 'reflect-metadata'` at the app entry (not imported here).
 * Apps supply their own `inject` / `injectable` decorators.
 */
export class InversifyContainer<
  IOCIdentifierMap extends Record<PropertyKey, unknown> = Record<
    PropertyKey,
    unknown
  >
> implements IOCContainerInterface
{
  protected container: Container;

  constructor() {
    assertReflectMetadata();
    this.container = new Container({
      // allow `@injectable` decorator, auto bind injectable classes
      autobind: true,
      // use singleton scope
      defaultScope: 'Singleton'
    });
  }

  /**
   * @override
   */
  public bind<T>(key: ServiceIdentifier<T>, value: T): void {
    this.container.bind<T>(key).toConstantValue(value);
  }

  /**
   * @override
   */
  public get<K extends keyof IOCIdentifierMap>(
    serviceIdentifier: K
  ): IOCIdentifierMap[K];
  /**
   * @override
   */
  public get<T>(serviceIdentifier: ServiceIdentifier<T>): T;
  /**
   * @override
   */
  public get<T, K extends keyof IOCIdentifierMap>(
    serviceIdentifier: ServiceIdentifier<T> | K
  ): T | IOCIdentifierMap[K] {
    return this.container.get(serviceIdentifier as ServiceIdentifier<T>);
  }
}
