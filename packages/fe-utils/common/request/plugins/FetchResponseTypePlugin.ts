import { ExecutorPlugin, ExecutorContextInterface } from '../../executor';
import { RequestAdapterResponse, RequestAdapterFetchConfig } from '../adapter';

export class FetchResponseTypePlugin implements ExecutorPlugin {
  readonly pluginName = 'FetchResponseTypePlugin';

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
    context: ExecutorContextInterface<RequestAdapterFetchConfig>
  ): Promise<RequestAdapterResponse> {
    const response = context.returnValue as Response;
    const config = context.parameters;

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
      case 'stream':
        return this.handleStreamResponse(response, config);
      default:
        return this.toAdapterResponse(await response.text(), response, config);
    }
  }

  /**
   * Handles the streaming response and tracks the progress.
   *
   * FIXME: if the content length is not available, the progress will not be accurate.
   *
   * @param response The Response object containing the stream.
   * @param config The configuration for the request adapter, which may include an onProgress callback.
   * @returns A promise that resolves to a RequestAdapterResponse.
   */
  async handleStreamResponse(
    response: Response,
    config: RequestAdapterFetchConfig
  ): Promise<RequestAdapterResponse> {
    const reader = response.body?.getReader();
    const contentLength = response.headers.get('Content-Length');
    let receivedLength = 0;
    const chunks: Uint8Array[] = [];
    const decoder = new TextDecoder();

    // Extract onProgress from config if available
    const onProgress = config.onStreamProgress;

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      chunks.push(value);
      receivedLength += value.length;

      // Calculate and report progress
      if (contentLength && onProgress) {
        const totalLength = parseInt(contentLength, 10);
        const progress = (receivedLength / totalLength) * 100;
        onProgress(progress);
      } else {
        onProgress?.(receivedLength);
      }
    }

    // Manually concatenate Uint8Array chunks
    const fullArray = new Uint8Array(receivedLength);
    let position = 0;
    for (const chunk of chunks) {
      fullArray.set(chunk, position);
      position += chunk.length;
    }

    const fullText = decoder.decode(fullArray);
    return this.toAdapterResponse(fullText, response, config);
  }
}
