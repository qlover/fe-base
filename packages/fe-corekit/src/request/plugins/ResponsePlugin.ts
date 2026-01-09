import {
  ExecutorContextInterface,
  ExecutorError,
  LifecyclePluginInterface
} from '../../executor/interface';
import { RequestAdapterConfig, RequestErrorID } from '../interface';
import { isAsString } from '../utils/isAsString';

export type ResponsePluginContext = ExecutorContextInterface<
  ResponsePluginConfig & RequestAdapterConfig,
  unknown
>;

export interface ResponsePluginConfig {
  /**
   * Whether to parse the response
   *
   * @default true
   */
  parseResponse?: boolean;
}

export class ResponsePlugin
  implements LifecyclePluginInterface<ResponsePluginContext>
{
  public readonly pluginName = 'ResponsePlugin';

  constructor(readonly config: ResponsePluginConfig = {}) {}

  /**
   * Post-execution hook that processes the response
   *
   * @override
   * @param context - Executor context
   *
   * @example
   * ```typescript
   * const response = new ResponsePlugin();
   * response.onSuccess(ctx);
   * ```
   */
  public onSuccess(context: ResponsePluginContext): void | Promise<void> {
    const returnValue = context.returnValue;

    // If it is a Response instance, it needs to ensure that the response is OK
    if (returnValue instanceof Response) {
      // To compatible with the logic of the FetchURLPlugin before
      // Directly set the response as the cause
      if (!returnValue.ok) {
        throw new ExecutorError(RequestErrorID.RESPONSE_NOT_OK, returnValue);
      }

      this.parseResponse(returnValue);
    }
  }
}
