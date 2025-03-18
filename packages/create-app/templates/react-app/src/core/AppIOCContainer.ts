import type { InversifyRegisterInterface } from '@/base/port/InversifyIocInterface';
import type { IOCContainerInterface } from '@lib/bootstrap';
import { ServiceIdentifier, Container } from 'inversify';

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

  get<T>(key: string): T {
    return this.container.get<T>(key);
  }
}
