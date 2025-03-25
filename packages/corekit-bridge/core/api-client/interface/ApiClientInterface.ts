import { IOCContainerInterface } from '../../bootstrap';

export interface ApiClientInterface<Config> {
  /**
   * default use plugins
   *
   * You can get plugins from IOC
   */
  usePlugins(ioc: IOCContainerInterface): void;

  /**
   * stop the request
   *
   * @param request
   */
  stop(request: Config): Promise<void> | void;
}
