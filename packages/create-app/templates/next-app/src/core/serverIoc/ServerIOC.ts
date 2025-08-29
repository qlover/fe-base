import {
  createIOCFunction,
  type IOCContainerInterface,
  type IOCFunctionInterface
} from '@qlover/corekit-bridge';
import { InversifyContainer } from '@/base/cases/InversifyContainer';
import type { IOCInterface } from '@/base/port/IOCInterface';
import { ServerIOCRegister } from './ServerIOCRegister';
import { appConfig } from '../globals';
import type { IOCIdentifierMapServer } from '@config/IOCIdentifier';

export class ServerIOC
  implements IOCInterface<IOCIdentifierMapServer, IOCContainerInterface>
{
  protected ioc: IOCFunctionInterface<
    IOCIdentifierMapServer,
    IOCContainerInterface
  > | null = null;

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
      appConfig: appConfig
    });

    register.register(this.ioc.implemention!, this.ioc);

    return this.ioc;
  }
}

export const serverIOC = new ServerIOC();
