import { ExecutorPlugin } from '../../executor';
import { RequestAdapterFetchConfig } from '../RequestAdapterFetch';
import { RequestAdapterResponse } from '../../interface/RequestAdapterInterface';
import { FetchStreamPlugin } from './FetchStreamPlugin';
import { ExecutorContextInterface } from '../../interface/ExecutorContextInterface';

export class FetchResponseTypePlugin implements ExecutorPlugin {
  toAdapterResponse(
    data: unknown,
    response: Response,
    config: RequestAdapterFetchConfig
  ): RequestAdapterResponse {
    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: this.getResponseHeaders(response),
      config,
      response
    };
  }

  getResponseHeaders(response: Response): Record<string, string> {
    const headersObj: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headersObj[key] = value;
    });
    return headersObj;
  }

  async onSuccess(
    context: ExecutorContextInterface
  ): Promise<RequestAdapterResponse> {
    const response = context.data as Response;
    const config = context.parameters as RequestAdapterFetchConfig;
    switch (config.responseType) {
      case 'json':
        return this.toAdapterResponse(await response.json(), response, config);
      case 'arraybuffer':
        return this.toAdapterResponse(
          await response.arrayBuffer(),
          response,
          config
        );
      case 'blob':
        return this.toAdapterResponse(await response.blob(), response, config);
      case 'formdata':
        return this.toAdapterResponse(
          await response.formData(),
          response,
          config
        );
      case 'text':
        return this.toAdapterResponse(await response.text(), response, config);
      case 'document':
        return this.toAdapterResponse(await response.text(), response, config); // Assuming text for document
      case 'stream': {
        const streamPlugin = new FetchStreamPlugin();
        return this.toAdapterResponse(
          await streamPlugin.onSuccess(context),
          response,
          config
        ); // Assuming stream is the body
      }
      default:
        return this.toAdapterResponse(await response.text(), response, config);
    }
  }
}
