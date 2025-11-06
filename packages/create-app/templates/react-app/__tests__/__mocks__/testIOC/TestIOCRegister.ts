import { IocRegisterOptions } from '@/base/port/IOCInterface';
import {
  IOCContainerInterface,
  IOCManagerInterface,
  IOCRegisterInterface
} from '@qlover/corekit-bridge';

export class TestIOCRegister
  implements IOCRegisterInterface<IOCContainerInterface, IocRegisterOptions>
{
  register(
    ioc: IOCContainerInterface,
    manager: IOCManagerInterface<IOCContainerInterface>
  ): void {
    throw new Error('Method not implemented.');
  }
}
