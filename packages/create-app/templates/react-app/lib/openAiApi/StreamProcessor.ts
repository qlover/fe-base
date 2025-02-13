export type StreamResultType = {
  content: string;
};

export class StreamProcessor {
  private decoder = new TextDecoder('utf-8');
  private buffer = '';

  async processStream(
    readableStream: ReadableStream<Uint8Array>
  ): Promise<StreamResultType> {
    let fullContent = '';

    const reader = readableStream.getReader();

    const shouldStop = (result: ReadableStreamReadResult<any>): boolean => {
      return result.done;
    };

    try {
      while (true) {
        const readResult = await reader.read();
        if (shouldStop(readResult)) break;

        const decodedChunk = this.decoder.decode(readResult.value, {
          stream: true
        });

        const processLineResult = await this.processChunk(decodedChunk);

        fullContent += processLineResult.value;

        if (processLineResult.done) break;
      }
    } finally {
      reader.releaseLock();
    }

    return {
      content: fullContent
    };
  }

  processLine(line: string) {
    const data = line.startsWith('data:') ? line.slice(6).trim() : '';

    if (data === '[DONE]') {
      return { done: true, value: '' };
    }

    const value = data ? JSON.parse(data).choices[0]?.delta?.content : '';

    return { done: false, value: value };
  }

  async processChunk(chunk: string) {
    let processedContent = '';
    this.buffer += chunk;
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';
    for (const line of lines) {
      try {
        const lineResult = this.processLine(line);

        if (lineResult.done) {
          return { value: processedContent, done: true };
        }

        if (!lineResult.value) {
          continue;
        }

        processedContent += lineResult.value;
      } catch (error) {
        console.error('Parsing error:', error);
        this.buffer = line + '\n' + this.buffer;
      }
    }
    return { value: processedContent, done: false };
  }
}
