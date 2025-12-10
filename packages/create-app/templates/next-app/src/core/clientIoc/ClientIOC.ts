import {
  createIOCFunction,
  type IOCContainerInterface,
  type IOCFunctionInterface,
  type IOCRegisterInterface
} from '@qlover/corekit-bridge';
import { InversifyContainer } from '@/base/cases/InversifyContainer';
import type {
  IOCInterface,
  IocRegisterOptions
} from '@/base/port/IOCInterface';
import type { IOCIdentifierMap } from '@config/IOCIdentifier';
import { ClientIOCRegister } from './ClientIOCRegister';

export class ClientIOC implements IOCInterface<
  IOCIdentifierMap,
  IOCContainerInterface
> {
  protected ioc: IOCFunctionInterface<
    IOCIdentifierMap,
    IOCContainerInterface
  > | null = null;
  protected registers = 0;

  constructor(
    protected readonly iocRegister?: IOCRegisterInterface<
      IOCContainerInterface,
      IocRegisterOptions
    >
  ) {}

  create(): IOCFunctionInterface<IOCIdentifierMap, IOCContainerInterface> {
    if (this.ioc) {
      return this.ioc;
    }

    this.ioc = createIOCFunction<IOCIdentifierMap>(new InversifyContainer());

    return this.ioc;
  }

  register(options: IocRegisterOptions): void {
    if (this.registers > 0) {
      return;
    }

    if (!this.ioc) {
      return;
    }

    new ClientIOCRegister(options).register(this.ioc.implemention!, this.ioc);

    this.registers++;
  }
}

export const clientIOC = new ClientIOC();
