import { IOCIdentifier } from '@config/ioc-identifiter';
import type { BootstrapExecutorPlugin } from '@qlover/corekit-bridge';

/** Server-only tokens shared on the frozen map; not bound in client IOC. */
const SERVER_ONLY_ALIASES = new Set([
  'AuthProviderInterface',
  'ServerContextInterface'
]);

/**
 * Dev-time check that client IOC bindings resolve.
 * Uses identifier *values* (e.g. `SeedConfigInterface`), not object key names.
 */
export const IocIdentifierTest: BootstrapExecutorPlugin = {
  pluginName: 'IocIdentifierTest',
  onSuccess({ parameters: { logger, ioc } }) {
    const errorList: string[] = [];

    for (const [alias, token] of Object.entries(IOCIdentifier)) {
      if (SERVER_ONLY_ALIASES.has(alias)) {
        continue;
      }

      try {
        const value = ioc.get(token);
        if (value === undefined) {
          errorList.push(alias);
        }
      } catch {
        errorList.push(alias);
      }
    }

    if (errorList.length > 0) {
      logger.warn(`IOC ${errorList.join(', ')} is not found`);
    } else {
      logger.info(
        `IOC all client identifiers are found (${Object.keys(IOCIdentifier).length - SERVER_ONLY_ALIASES.size})`
      );
    }
  }
};
