import {
  ExecutorContext,
  ExecutorPlugin,
  RequestAdapterFetchConfig
} from '@qlover/fe-utils';
import { OpenAIAargs, OpenAIChatParmas } from './OpenAIClient';

export class OpenAIAuthPlugin
  implements ExecutorPlugin<RequestAdapterFetchConfig, void>
{
  readonly pluginName = 'OpenAIAuthPlugin';

  constructor(private readonly openAIAargs: OpenAIAargs) {}

  onBefore(
    context: ExecutorContext<RequestAdapterFetchConfig<OpenAIChatParmas>>
  ): void {
    if (!context.parameters.headers) {
      context.parameters.headers = {};
    }

    const { apiKey, model, stream } = this.openAIAargs;

    context.parameters.headers['Authorization'] = `Bearer ${apiKey}`;
    context.parameters.headers['Content-Type'] = 'application/json';

    // check modeal and stream
    if (!context.parameters.data) {
      context.parameters.data = { messages: [], model, stream };
    }

    context.parameters.data!.model = context.parameters.data!.model ?? model;
    context.parameters.data!.stream = context.parameters.data!.stream ?? stream;

    // FIXME: RequestAdapterFetchConfig.body is not supported
    context.parameters.body = JSON.stringify(context.parameters.data);

    console.log('OpenAIAuthPlugin onBefore', context.parameters);
  }

  onSuccess(context: ExecutorContext<RequestAdapterFetchConfig>): void {
    console.log('OpenAIAuthPlugin onSuccess', context.returnValue);
  }
}
