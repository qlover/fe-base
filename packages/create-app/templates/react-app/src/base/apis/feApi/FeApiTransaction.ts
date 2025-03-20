import { ApiTransactionInterface } from '@/base/port/ApiTransactionInterface';
import { ApiPickDataResponse } from '@/base/cases/apisPlugins/ApiPickDataPlugin';
/**
 * class `FeApi` 的处理事务接口
 */
export interface FeApiTransaction<Request, Response>
  extends ApiTransactionInterface<
    Request,
    ApiPickDataResponse<Request, Response>
  > {}
