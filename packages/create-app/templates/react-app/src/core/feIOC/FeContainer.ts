import {
  IOCContainerInterface,
  IOCRegisterInterface
} from '@/base/port/IOCContainerInterface';
import { Container } from 'inversify';
import { RegisterGlobals } from './RegisterGlobals';
import { RegisterCommon } from './RegisterCommon';
import { RegisterApi } from './RegisterApi';
import { RegisterControllers } from './RegisterControllers';

export class FeContainer implements IOCContainerInterface {
  private container: Container;

  constructor() {
    this.container = new Container({
      // allow `@injectable` decorator, auto bind injectable classes
      autobind: true,
      // use singleton scope
      defaultScope: 'Singleton'
    });
  }

  configure(): void {
    const registers: IOCRegisterInterface<Container>[] = [
      new RegisterGlobals(),
      new RegisterCommon(),
      new RegisterApi(),
      new RegisterControllers()
    ];

    registers.forEach((register) => register.register(this.container));
  }

  bind<T>(key: string, value: T): void {
    this.container.bind<T>(key).toConstantValue(value);
  }

  get<T>(key: string): T {
    return this.container.get<T>(key);
  }
}
