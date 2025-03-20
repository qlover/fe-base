import { ApiTransactionInterface } from '@/base/port/ApiTransactionInterface';
import { RequestAdapterResponse } from '@qlover/fe-utils';
import { ApiCatchResult } from '../../cases/apisPlugins/ApiCatchPlugin';

/**
 * extends RequestAdapterResponse
 *
 * - add catchError
 */
export interface WrapperFeApiResponse<Request, Response>
  extends Omit<RequestAdapterResponse<Request>, 'data'> {
  /**
   * `ApiCatchPlugin` returns value
   */
  data: Response | ApiCatchResult;
}

/**
 * class `FeApi` 的处理事务接口
 *
 * 包含：
 * - 带 request 的请求参数
 * - 带 response 的统一返回值
 */
export interface FeApiTransaction<Request, Response>
  extends ApiTransactionInterface<
    Request,
    WrapperFeApiResponse<Request, Response>
  > {}
