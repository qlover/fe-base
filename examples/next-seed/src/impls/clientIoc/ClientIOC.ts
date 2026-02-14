import {
  createIOCFunction,
  type IOCContainerInterface,
  type IOCFunctionInterface,
  type IOCRegisterInterface
} from '@qlover/corekit-bridge';
import type { IOCIdentifierMap } from '@shared/config/ioc-identifiter';
import { InversifyContainer } from '@shared/container/InversifyContainer';
import type {
  IOCInterface,
  IocRegisterOptions
} from '@shared/interfaces/IOCInterface';
import { ClientIOCRegister } from './ClientIOCRegister';
import { logger } from '../globals';

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

  /**
   * @override
   */
  public create(): IOCFunctionInterface<
    IOCIdentifierMap,
    IOCContainerInterface
  > {
    if (this.ioc) {
      return this.ioc;
    }

    this.ioc = createIOCFunction<IOCIdentifierMap>(new InversifyContainer());

    return this.ioc;
  }

  /**
   * @override
   */
  public register(options: IocRegisterOptions): void {
    if (this.registers > 0) {
      return;
    }

    if (!this.ioc) {
      return;
    }

    logger.info('ClientIOC register');
    new ClientIOCRegister(options).register(this.ioc.implemention!, this.ioc);

    this.registers++;
  }
}

export const clientIOC = new ClientIOC();
