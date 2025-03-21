import { RequestScheduler } from '@qlover/fe-corekit';

export abstract class ApiClient<Config> extends RequestScheduler<Config> {
  /**
   * stop the request
   *
   * @param request
   */
  abstract stop(request: Config): Promise<void> | void;
}
