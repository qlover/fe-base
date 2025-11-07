import type { BootstrapClientArgs } from '@/core/bootstraps/BootstrapClient';
import { BootstrapClient } from '@/core/bootstraps/BootstrapClient';
import { testIOC } from './testIOC/TestIOC';

export interface BootstrapTestArgs extends Omit<BootstrapClientArgs, 'ioc'> {
  ioc?: BootstrapClientArgs['ioc'];
}

export class BootstrapTest {
  static async main(args: BootstrapTestArgs): Promise<BootstrapClientArgs> {
    const result = await BootstrapClient.main({ ...args, ioc: testIOC });
    return result;
  }
}
