import {
  createIOCFunction,
  type IOCContainerInterface,
  type IOCFunctionInterface
} from '@qlover/corekit-bridge';
import { AppConfig } from '@/base/cases/AppConfig';
import { InversifyContainer } from '@/base/cases/InversifyContainer';
import type { IOCInterface } from '@/base/port/IOCInterface';
import type { IOCIdentifierMapServer } from '@config/IOCIdentifier';
import { ServerIOCRegister } from './ServerIOCRegister';

export class ServerIOC
  implements IOCInterface<IOCIdentifierMapServer, IOCContainerInterface>
{
  static instance: ServerIOC | null = null;

  protected ioc: IOCFunctionInterface<
    IOCIdentifierMapServer,
    IOCContainerInterface
  > | null = null;

  static create(): ServerIOC {
    if (this.instance) {
      return this.instance;
    }

    this.instance = new ServerIOC();

    return this.instance;
  }

  create(): IOCFunctionInterface<
    IOCIdentifierMapServer,
    IOCContainerInterface
  > {
    if (this.ioc) {
      return this.ioc;
    }

    this.ioc = createIOCFunction<IOCIdentifierMapServer>(
      new InversifyContainer()
    );

    const register = new ServerIOCRegister({
      appConfig: new AppConfig()
    });

    register.register(this.ioc.implemention!, this.ioc);

    return this.ioc;
  }
}
