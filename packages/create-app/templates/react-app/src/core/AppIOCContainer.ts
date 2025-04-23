import type { InversifyRegisterInterface } from '@/base/port/InversifyIocInterface';
import type { IOCContainerInterface } from '@qlover/corekit-bridge';
import type { IOCIdentifierMap } from '@/core/IOC';
import type { ServiceIdentifier } from 'inversify';
import { Container } from 'inversify';

export class AppIOCContainer implements IOCContainerInterface {
  private container: Container;

  constructor() {
    this.container = new Container({
      // allow `@injectable` decorator, auto bind injectable classes
      autobind: true,
      // use singleton scope
      defaultScope: 'Singleton'
    });
  }

  configure(registers?: InversifyRegisterInterface[]): void {
    if (registers) {
      registers.forEach((register) => register.register(this.container, this));
    }
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
