import { ExecutorPlugin } from '../../executor';
import { RequestAdapterFetchConfig } from '../RequestAdapterFetch';

export type StreamApiProcessorType = {
  content: string;
};

export class FetchStreamPlugin implements ExecutorPlugin {
  private decoder: TextDecoder;
  private buffer = '';

  constructor() {
    this.decoder = new TextDecoder();
  }

  async onSuccess(
    response: Response,
    config: RequestAdapterFetchConfig
  ): Promise<StreamApiProcessorType> {
    return this.processStream(response, config);
  }

  async processStream(
    response: Response,
    config: RequestAdapterFetchConfig
  ): Promise<StreamApiProcessorType> {
    let fullContent = '';

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const decodedChunk = this.decoder.decode(value, { stream: true });
        const { processedContent, shouldStop } = await this.processChunk(
          decodedChunk,
          config
        );
        fullContent += processedContent;

        if (shouldStop) break;
      }
    } finally {
      reader.releaseLock();
    }

    return {
      content: fullContent
    };
  }

  private async processChunk(
    chunk: string,
    config: RequestAdapterFetchConfig
  ): Promise<{ processedContent: string; shouldStop: boolean }> {
    let processedContent = '';
    let shouldStop = false;

    this.buffer += chunk;
    const lines = this.buffer.split('\n');

    // 保留最后一行，可能是不完整的
    this.buffer = lines.pop() || '';

    const { onStreamChunk } = config;

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') {
          shouldStop = true;
          break;
        }

        try {
          if (onStreamChunk) {
            const parsedContent = onStreamChunk?.call(config, data);

            if (typeof parsedContent !== 'string') {
              throw new Error('onStreamChunk must return a string');
            }

            processedContent += parsedContent;
          } else {
            processedContent += data;
          }
        } catch (error) {
          console.error('解析错误:', error);
          // 不完整的 JSON，添加回 buffer
          this.buffer = line + '\n' + this.buffer;
        }
      }
    }

    return { processedContent, shouldStop };
  }
}
