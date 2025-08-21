import { IOCIdentifier } from '@config/IOCIdentifier';
import { BootstrapExecutorPlugin } from '@qlover/corekit-bridge';

export const IocIdentifierTest: BootstrapExecutorPlugin = {
  pluginName: 'IocIdentifierTest',
  onSuccess({ parameters: { logger, ioc } }) {
    const errorList: string[] = [];
    const keyList: string[] = Object.keys(IOCIdentifier);
    keyList.forEach((key) => {
      try {
        const value = ioc.get(key);
        if (value === undefined) {
          errorList.push(key);
        }
      } catch {
        errorList.push(key);
      }
    });

    if (errorList.length > 0) {
      logger.warn(`IOC ${errorList.join(', ')} is not found`);
    } else {
      logger.info(`IOC all identifiers are found ${keyList.length}`);
    }
  }
};
