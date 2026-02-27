import {
  createIOCFunction,
  type IOCContainerInterface,
  type IOCFunctionInterface,
  type IOCRegisterInterface
} from '@qlover/corekit-bridge/ioc';
import { SimpleIOCContainer } from '@shared/container/SimpleIOCContainer';
import type { IOCIdentifierMapServer } from '@config/ioc-identifiter';
import { I } from '@config/ioc-identifiter';
import { logger, serverConfig } from './ServerGlobals';
import { SupabaseBridge } from './SupabaseBridge';

let ServerIoc: IOCFunctionInterface<
  IOCIdentifierMapServer,
  IOCContainerInterface
> | null = null;

export function createServerIoc() {
  if (ServerIoc) {
    return ServerIoc;
  }

  ServerIoc = createIOCFunction(new SimpleIOCContainer(logger));

  ServerIocRegister.register(ServerIoc.implemention!, ServerIoc);

  return ServerIoc;
}

const ServerIocRegister: IOCRegisterInterface<IOCContainerInterface> = {
  register(ioc) {
    ioc.bind(I.AppConfig, serverConfig);
    ioc.bind(I.Logger, logger);

    ioc.bind(I.DBBridgeInterface, ioc.get(SupabaseBridge));
  }
};
