import {
  BootstrapClient,
  BootstrapClientArgs
} from '@/core/bootstraps/BootstrapClient';
import { testIOC } from './testIOC/TestIOC';

export interface BootstrapTestArgs extends Omit<BootstrapClientArgs, 'ioc'> {
  ioc?: BootstrapClientArgs['ioc'];
}

export class BootstrapTest {
  static async main(args: BootstrapTestArgs): Promise<void> {
    BootstrapClient.main({ ...args, ioc: testIOC });
  }
}
