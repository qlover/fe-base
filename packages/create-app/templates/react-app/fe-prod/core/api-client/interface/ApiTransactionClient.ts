import { RequestTransaction } from '@qlover/fe-corekit';
import { IOCContainerInterface } from '../../bootstrap';

export abstract class ApiTransactionClient<
  Config
> extends RequestTransaction<Config> {
  /**
   * default use plugins
   *
   * You can get plugins from IOC
   */
  abstract usePlugins(ioc: IOCContainerInterface): void;

  /**
   * stop the request
   *
   * @param request
   */
  abstract stop(request: Config): Promise<void> | void;
}
