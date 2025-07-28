import { IOCIdentifierMap } from '@/core/IOC';
import {
  IOCContainerInterface,
  ServiceIdentifier
} from '@qlover/corekit-bridge';
import { Container } from 'inversify';

export class InversifyContainer implements IOCContainerInterface {
  private container: Container;

  constructor() {
    this.container = new Container({
      // allow `@injectable` decorator, auto bind injectable classes
      autobind: true,
      // use singleton scope
      defaultScope: 'Singleton'
    });
  }

  bind<T>(key: ServiceIdentifier<T>, value: T): void {
    this.container.bind<T>(key).toConstantValue(value);
  }

  get<K extends keyof IOCIdentifierMap>(
    serviceIdentifier: K
  ): IOCIdentifierMap[K];
  get<T>(serviceIdentifier: ServiceIdentifier<T>): T;
  get<T, K extends keyof IOCIdentifierMap>(
    serviceIdentifier: ServiceIdentifier<T> | K
  ): T | IOCIdentifierMap[K] {
    return this.container.get<T>(serviceIdentifier);
  }
}
