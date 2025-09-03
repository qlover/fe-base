import {
  createIOCFunction,
  type IOCContainerInterface,
  type IOCFunctionInterface
} from '@qlover/corekit-bridge';
import { InversifyContainer } from '@/base/cases/InversifyContainer';
import type { IOCInterface } from '@/base/port/IOCInterface';
import { ClientIOCRegister } from './ClientIOCRegister';
import { appConfig } from '../globals';
import type { IOCIdentifierMap } from '@config/IOCIdentifier';

export class ClientIOC
  implements IOCInterface<IOCIdentifierMap, IOCContainerInterface>
{
  protected ioc: IOCFunctionInterface<
    IOCIdentifierMap,
    IOCContainerInterface
  > | null = null;

  create(): IOCFunctionInterface<IOCIdentifierMap, IOCContainerInterface> {
    if (this.ioc) {
      return this.ioc;
    }

    this.ioc = createIOCFunction<IOCIdentifierMap>(new InversifyContainer());

    const register = new ClientIOCRegister({
      appConfig: appConfig
    });

    register.register(this.ioc.implemention!, this.ioc);

    return this.ioc;
  }
}

export const clientIOC = new ClientIOC();
