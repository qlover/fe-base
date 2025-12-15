import { Container } from 'inversify';
import type { IOCIdentifierMap } from '@config/IOCIdentifier';
import type {
  IOCContainerInterface,
  ServiceIdentifier
} from '@qlover/corekit-bridge';

export class InversifyContainer implements IOCContainerInterface {
  protected container: Container;

  constructor() {
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
    return this.container.get<T>(serviceIdentifier);
  }
}
