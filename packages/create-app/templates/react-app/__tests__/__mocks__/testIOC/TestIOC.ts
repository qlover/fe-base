import { createIOCFunction } from '@qlover/corekit-bridge';
import { InversifyContainer } from '@/base/cases/InversifyContainer';
import type { IOCInterface } from '@/base/port/IOCInterface';
import type { IOCIdentifierMap } from '@config/IOCIdentifier';
import { TestIOCRegister } from './TestIOCRegister';
import type {
  IOCContainerInterface,
  IOCFunctionInterface
} from '@qlover/corekit-bridge';

export class TestIOC
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
    const register = new TestIOCRegister();
    // const register = new ClientIOCRegister({
    //   pathname: '/en/test',
    //   appConfig: appConfig
    // });

    register.register(this.ioc.implemention!, this.ioc);

    return this.ioc;
  }
}

export const testIOC = new TestIOC();
