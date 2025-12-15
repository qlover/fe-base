import {
  createIOCFunction,
  type IOCContainerInterface,
  type IOCFunctionInterface
} from '@qlover/corekit-bridge';
import { AppConfig } from '@/base/cases/AppConfig';
import { InversifyContainer } from '@/base/cases/InversifyContainer';
import type {
  IOCInterface,
  IocRegisterOptions
} from '@/base/port/IOCInterface';
import type { IOCIdentifierMapServer } from '@config/IOCIdentifier';
import { ServerIOCRegister } from './ServerIOCRegister';

export class ServerIOC implements IOCInterface<
  IOCIdentifierMapServer,
  IOCContainerInterface
> {
  public static instance: ServerIOC | null = null;

  protected registers = 0;

  protected ioc: IOCFunctionInterface<
    IOCIdentifierMapServer,
    IOCContainerInterface
  > | null = null;

  /**
   * @override
   */
  public static create(): ServerIOC {
    if (this.instance) {
      return this.instance;
    }

    this.instance = new ServerIOC();

    return this.instance;
  }

  /**
   * @override
   */
  public create(): IOCFunctionInterface<
    IOCIdentifierMapServer,
    IOCContainerInterface
  > {
    if (this.ioc) {
      return this.ioc;
    }

    this.ioc = createIOCFunction(new InversifyContainer());

    // 注册默认依赖
    this.register({
      appConfig: new AppConfig()
    });

    return this.ioc;
  }

  /**
   * @override
   */
  public register(options: IocRegisterOptions): void {
    if (this.registers > 0) {
      console.debug('ServerIOC: ioc already registered');
      return;
    }

    if (!this.ioc) {
      console.debug('ServerIOC: ioc not initialized');
      return;
    }

    new ServerIOCRegister(options).register(this.ioc.implemention!, this.ioc);

    this.registers++;
  }
}
