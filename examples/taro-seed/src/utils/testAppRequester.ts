import { fetchIpinfo } from '@/impls/AppRequester';
import type { BootstrapExecutorPlugin } from '@qlover/corekit-bridge';
import type { LoggerInterface } from '@qlover/logger';

export const testAppRequester: BootstrapExecutorPlugin = {
  pluginName: 'testAppRequester',
  onBefore({ parameters: { ioc } }) {
    const logger = ioc.get<LoggerInterface>('Logger');

    fetchIpinfo().then((res) => {
      logger.debug('testAppRequester', res);
    });
  }
};
