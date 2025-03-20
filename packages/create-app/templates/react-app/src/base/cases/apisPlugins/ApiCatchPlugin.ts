import { ApiClientInterceptingInterface } from '@lib/api-client';
import { ExecutorPlugin } from '@qlover/fe-utils';
import { injectable } from 'inversify';

export class ApiCatchResult {
  id: string = '';
}

/**
 * Api request error catch plugin
 *
 * 不让错误抛出，仅返回错误和数据
 */
@injectable()
export class ApiCatchPlugin
  extends ApiClientInterceptingInterface<ApiCatchResult>
  implements ExecutorPlugin
{
  readonly pluginName = 'ApiCatchPlugin';

  /**
   * @override
   */
  static is(result: unknown): result is ApiCatchResult {
    return result instanceof ApiCatchResult;
  }
}
