import {
  createIOCFunction,
  type IOCContainerInterface,
  type IOCFunctionInterface
} from '@qlover/corekit-bridge';
import { InversifyContainer } from '@/base/cases/InversifyContainer';
import type { IOCInterface } from '@/base/port/IOCInterface';
import type { IOCIdentifierMap } from '@config/IOCIdentifier';
import { ClientIOCRegister } from './ClientIOCRegister';
import { appConfig } from '../globals';

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

    // move to BootstrapClient
    const register = new ClientIOCRegister({
      pathname: window.location.pathname,
      appConfig: appConfig
    });

    register.register(this.ioc.implemention!, this.ioc);

    return this.ioc;
  }
}

export const clientIOC = new ClientIOC();
