import type { RequestEncryptPluginProps } from '@/base/cases/RequestEncryptPlugin';
import type { AppApiResponse } from '@/base/port/AppApiInterface';
import type {
  RequestAdapterConfig,
  RequestAdapterResponse
} from '@qlover/fe-corekit';

export interface AdminApiConfig<Request = unknown>
  extends RequestAdapterConfig<Request>,
    RequestEncryptPluginProps<Request> {}

/**
 * AdminApiResponse
 *
 * @description
 * AdminApiResponse is the response for the AdminApi.
 *
 * extends:
 * - RequestAdapterResponse<Request, Response>
 */
export type AdminApiResponse<
  Request = unknown,
  Response = unknown
> = RequestAdapterResponse<Request, AppApiResponse<Response>>;
