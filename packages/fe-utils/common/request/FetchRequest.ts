import { AsyncExecutor, ExecutorError } from '../executor';
import { FetchRequestConfig } from './FetchRequestConfig';
import { RequestExecutor } from './RequestExecutor';
import merge from 'lodash/merge';

export enum FetchRequestErrorID {
  FETCH_REQUEST_ERROR = 'FETCH_REQUEST_ERROR',
  ENV_FETCH_NOT_SUPPORT = 'ENV_FETCH_NOT_SUPPORT',
  FETCHER_NONE = 'FETCHER_NONE',
  RESPONSE_NOT_OK = 'RESPONSE_NOT_OK',
  ABORT_ERROR = 'ABORT_ERROR'
}

export class FetchRequestError extends ExecutorError {
  constructor(id: string, originalError?: string | Error) {
    super(id, originalError);
  }
}

export class FetchRequest extends RequestExecutor<FetchRequestConfig> {
  constructor(config: Partial<FetchRequestConfig> = {}) {
    if (!config.fetcher) {
      if (typeof fetch !== 'function') {
        throw new FetchRequestError(FetchRequestErrorID.ENV_FETCH_NOT_SUPPORT);
      }

      config.fetcher = fetch;
    }

    // use AsyncExecutor
    const executor = config.executor || new AsyncExecutor();

    super(config as FetchRequestConfig, executor);
  }

  /**
   * @override
   * @returns Response
   */
  async request(config: FetchRequestConfig): Promise<Response> {
    const thisConfig = this.getConfig();
    const mergedConfig = merge({}, thisConfig, config);
    const fetcher = mergedConfig.fetcher;

    if (typeof fetcher !== 'function') {
      throw new FetchRequestError(FetchRequestErrorID.FETCHER_NONE);
    }

    return this.executor.exec(mergedConfig, () =>
      fetcher(mergedConfig.url, this.composeRequestInit(mergedConfig))
    );
  }

  /**
   * pick RequestInit from FetchRequestConfig
   * @param config
   * @returns
   */
  private composeRequestInit(config: FetchRequestConfig): RequestInit {
    // FIXME: @type/node
    const typeNode = { dispatcher: config.dispatcher, duplex: config.duplex };
    return {
      body: config.body,
      cache: config.cache,
      credentials: config.credentials,
      headers: config.headers,
      integrity: config.integrity,
      keepalive: config.keepalive,
      method: config.method,
      mode: config.mode,
      priority: config.priority,
      redirect: config.redirect,
      referrer: config.referrer,
      referrerPolicy: config.referrerPolicy,
      signal: config.signal,

      /** Can only be null. Used to disassociate request from any Window. */
      window: null,

      ...typeNode
    };
  }
}
