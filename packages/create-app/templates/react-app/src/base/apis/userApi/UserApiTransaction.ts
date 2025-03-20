import { ApiTransactionInterface } from '@/base/port/ApiTransactionInterface';
import { ApiCatchPluginResponse } from '@/base/cases/apisPlugins/ApiCatchPlugin';
/**
 * class `UserApi` 的处理事务接口
 *
 */
export interface UserApiTransaction<Request, Response>
  extends ApiTransactionInterface<
    Request,
    ApiCatchPluginResponse<Request, Response>
  > {}
