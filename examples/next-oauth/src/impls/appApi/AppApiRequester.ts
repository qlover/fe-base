import {
  AborterPlugin,
  type AborterConfig,
  type AborterId
} from '@qlover/fe-corekit/aborter';
import { LifecycleExecutor } from '@qlover/fe-corekit/executor';
import {
  RequestAdapterFetch,
  RequestExecutor
} from '@qlover/fe-corekit/request';
import type { RequestEncryptPluginProps } from '@/impls/RequestEncryptPlugin';
import { injectable } from '@shared/container';
import { AppApiPluginOptions } from './AppApiPlugin';
import type { DialogErrorConfig } from '../DialogErrorPlugin';
import type { ExecutorContextInterface } from '@qlover/fe-corekit/executor';
import type {
  RequestAdapterConfig,
  RequestAdapterResponse
} from '@qlover/fe-corekit/request';
import type { NextKitApiResult } from '@qlover/next-kit/common';

export interface RequestTransactionInterface<Request, Response> {
  request: Request;
  response: Response;
}

export type AppApiConfig<Request = unknown> = RequestAdapterConfig<Request> &
  RequestEncryptPluginProps<Request> &
  DialogErrorConfig &
  AppApiPluginOptions &
  AborterConfig;

export interface AppApiRequesterContext extends ExecutorContextInterface<AppApiConfig> {}

/**
 * UserApiResponse
 *
 * @description
 * UserApiResponse is the response for the UserApi.
 *
 * extends:
 * - RequestAdapterResponse<Request, Response>
 */
export type AppApiResponse<
  Request = unknown,
  Response = unknown
> = RequestAdapterResponse<Request, NextKitApiResult<Response>>;

/**
 * UserApi common transaction
 */
export interface AppApiTransaction<
  Request = unknown,
  Response = unknown
> extends RequestTransactionInterface<
  AppApiConfig<Request>,
  AppApiResponse<Request, Response>
> {
  data: AppApiConfig<Request>['data'];
}

@injectable()
export class AppApiRequester extends RequestExecutor<
  AppApiConfig,
  AppApiRequesterContext
> {
  /**
   * Never aborted. Only satisfies AborterPlugin's DEV check that `signal`
   * exists on config; the plugin still registers its own controller for
   * `abortId` / `stop()`.
   */
  private static readonly idleSignal = new AbortController().signal;

  private readonly aborterPlugin = new AborterPlugin<AppApiConfig>({
    pluginName: 'AppApiAborter',
    getConfig: (parameters) => {
      const config = parameters as AppApiConfig;
      if (config?.signal instanceof AbortSignal) {
        return config;
      }
      return { ...config, signal: AppApiRequester.idleSignal };
    }
  });

  constructor() {
    super(
      new RequestAdapterFetch({
        // baseURL: '/api',
        responseType: 'json'
      }),
      new LifecycleExecutor()
    );
    this.use(this.aborterPlugin);
  }

  /**
   * Abort in-flight request(s) by `abortId` (or all if omitted).
   * Use from effect cleanup: `return () => appApiRequester.stop(abortId)`.
   */
  public stop(abortId?: AborterId): void {
    if (abortId == null) {
      this.aborterPlugin.abortAll();
      return;
    }
    this.aborterPlugin.abort(abortId);
  }

  /** Alias of {@link stop}. */
  public cancelled(abortId?: AborterId): void {
    this.stop(abortId);
  }
}
