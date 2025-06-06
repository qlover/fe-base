import { RegisterGlobals } from './RegisterGlobals';
import { RegisterCommon } from './RegisterCommon';
import { RegisterApi } from './RegisterApi';
import { RegisterControllers } from './RegisterControllers';
import {
  InversifyContainer,
  InversifyRegisterInterface,
  IocRegisterOptions
} from '../IOC';
import { IOCManagerInterface } from '@qlover/corekit-bridge';

export class IocRegister implements InversifyRegisterInterface {
  constructor(protected options: IocRegisterOptions) {}

  getRegisterList(): InversifyRegisterInterface[] {
    return [
      new RegisterGlobals(),
      new RegisterCommon(),
      new RegisterApi(),
      new RegisterControllers()
    ];
  }

  register(
    ioc: InversifyContainer,
    manager: IOCManagerInterface<InversifyContainer>
  ): void {
    this.getRegisterList().forEach((register) => {
      register.register(ioc, manager, this.options);
    });
  }
}
