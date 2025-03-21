import {
  ExecutorContext,
  ExecutorPlugin,
  RequestAdapterFetchConfig,
  RequestAdapterResponse
} from '@qlover/fe-corekit';
import { StreamProcessor } from './StreamProcessor';

export class OpenAIAuthPlugin
  implements ExecutorPlugin<RequestAdapterFetchConfig>
{
  readonly pluginName = 'OpenAIAuthPlugin';

  async onSuccess(
    context: ExecutorContext<RequestAdapterFetchConfig>
  ): Promise<void> {
    const adapterResponse = context.returnValue as RequestAdapterResponse<
      Request,
      Response
    >;

    if (adapterResponse.data.body instanceof ReadableStream) {
      const processer = new StreamProcessor();
      const data = await processer.processStream(adapterResponse.data.body);
      // overried response data
      context.returnValue = data;
    }
  }
}
