import type { IOCContainer, IOCRegister, IocRegisterOptions } from '../IOC';
import type { IOCManagerInterface } from '@qlover/corekit-bridge';
import { RegisterGlobals } from './RegisterGlobals';
import { RegisterCommon } from './RegisterCommon';
import { RegisterControllers } from './RegisterControllers';

export class IocRegisterImpl implements IOCRegister {
  constructor(protected options: IocRegisterOptions) {}

  getRegisterList(): IOCRegister[] {
    return [RegisterGlobals, RegisterCommon, new RegisterControllers()];
  }

  /**
   * @override
   */
  register(
    ioc: IOCContainer,
    manager: IOCManagerInterface<IOCContainer>
  ): void {
    this.getRegisterList().forEach((Register) => {
      Register.register(ioc, manager, this.options);
    });
  }
}
