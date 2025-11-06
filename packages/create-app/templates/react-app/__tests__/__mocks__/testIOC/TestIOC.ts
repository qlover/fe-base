import { IOCInterface } from '@/base/port/IOCInterface';
import { IOCIdentifierMap } from '@config/IOCIdentifier';
import {
  IOCContainerInterface,
  IOCFunctionInterface
} from '@qlover/corekit-bridge';

export class TestIOC
  implements IOCInterface<IOCIdentifierMap, IOCContainerInterface>
{
  create(): IOCFunctionInterface<IOCIdentifierMap, IOCContainerInterface> {}
}

export const testIOC = new TestIOC();
