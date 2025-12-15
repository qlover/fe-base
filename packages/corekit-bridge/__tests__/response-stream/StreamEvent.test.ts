/**
 * StreamEvent test-suite
 *
 * Coverage:
 * 1. constructor       - Constructor tests
 * 2. parseChunk       - Chunk parsing tests with different data types
 * 3. processBuffer    - Buffer processing tests
 * 4. append          - Buffer appending tests
 * 5. doned           - Stream completion tests
 * 6. finished        - Stream finish state tests
 * 7. isFinished      - Finish state check tests
 * 8. integration     - Full workflow tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StreamEvent } from '../../src/core/response-stream/StreamEvent';
import { StreamProcessorInterface } from '../../src/core/response-stream/StreamProcessorInterface';

describe('StreamEvent', () => {
  // Mock processor implementation
  class MockProcessor implements StreamProcessorInterface {
    public processChunk = vi.fn((data: string) => [data]);
    public processFinal = vi.fn((data: string) => data);
  }

  let processor: MockProcessor;
  let streamEvent: StreamEvent;

  beforeEach(() => {
    processor = new MockProcessor();
    streamEvent = new StreamEvent(processor);
  });

  describe('constructor', () => {
    it('should create instance with default decoder', () => {
      expect(streamEvent).toBeInstanceOf(StreamEvent);
      expect(streamEvent['times']).toBe(0);
      expect(streamEvent['finish']).toBe(false);
      expect(streamEvent['bufferChunks']).toEqual([]);
    });

    it('should create instance with custom decoder', () => {
      const customDecoder = new TextDecoder('utf-8');
      const customEvent = new StreamEvent(processor, customDecoder);
      expect(customEvent).toBeInstanceOf(StreamEvent);
    });
  });

  describe('parseChunk', () => {
    it('should handle ArrayBuffer input', () => {
      const data = new TextEncoder().encode('test data');
      const result = streamEvent.parseChunk(data.buffer);
      expect(result).toBe('test data');
      expect(streamEvent['times']).toBe(1);
    });

    it('should handle Uint8Array input', () => {
      const data = new TextEncoder().encode('test data');
      const result = streamEvent.parseChunk(data);
      expect(result).toBe('test data');
      expect(streamEvent['times']).toBe(1);
    });

    it('should handle string input', () => {
      const result = streamEvent.parseChunk('test data');
      expect(result).toBe('test data');
      expect(streamEvent['times']).toBe(1);
    });

    it('should handle number input', () => {
      const result = streamEvent.parseChunk(123);
      expect(result).toBe('123');
      expect(streamEvent['times']).toBe(1);
    });

    it('should increment times counter', () => {
      streamEvent.parseChunk('first');
      streamEvent.parseChunk('second');
      expect(streamEvent['times']).toBe(2);
    });
  });

  describe('processBuffer', () => {
    it('should return empty array for empty buffer', () => {
      const result = streamEvent.processBuffer();
      expect(result).toEqual([]);
    });

    it('should process all chunks in buffer', () => {
      streamEvent.append('chunk1');
      streamEvent.append('chunk2');
      const result = streamEvent.processBuffer();
      expect(processor.processChunk).toHaveBeenCalledTimes(2);
      expect(result).toEqual(['chunk1', 'chunk2']);
    });

    it('should clear buffer after processing', () => {
      streamEvent.append('chunk1');
      streamEvent.processBuffer();
      expect(streamEvent['bufferChunks']).toEqual([]);
    });
  });

  describe('append', () => {
    it('should append non-empty chunks to buffer', () => {
      streamEvent.append('chunk1');
      expect(streamEvent['bufferChunks']).toEqual(['chunk1']);
    });

    it('should not append empty chunks', () => {
      streamEvent.append('');
      expect(streamEvent['bufferChunks']).toEqual([]);
    });

    it('should maintain chunk order', () => {
      streamEvent.append('chunk1');
      streamEvent.append('chunk2');
      streamEvent.append('chunk3');
      expect(streamEvent['bufferChunks']).toEqual([
        'chunk1',
        'chunk2',
        'chunk3'
      ]);
    });
  });

  describe('doned', () => {
    it('should return undefined for empty buffer', () => {
      const result = streamEvent.doned();
      expect(result).toBeUndefined();
      expect(streamEvent.isFinished()).toBe(true);
    });

    it('should process remaining data and clear buffer', () => {
      streamEvent.append('chunk1');
      streamEvent.append('chunk2');
      const result = streamEvent.doned();
      expect(processor.processFinal).toHaveBeenCalledWith('chunk1chunk2');
      expect(result).toBe('chunk1chunk2');
      expect(streamEvent['bufferChunks']).toEqual([]);
    });

    it('should mark stream as finished', () => {
      streamEvent.doned();
      expect(streamEvent.isFinished()).toBe(true);
    });
  });

  describe('finished', () => {
    it('should mark stream as finished', () => {
      streamEvent.finished();
      expect(streamEvent.isFinished()).toBe(true);
    });

    it('should be idempotent', () => {
      streamEvent.finished();
      streamEvent.finished();
      expect(streamEvent.isFinished()).toBe(true);
    });
  });

  describe('integration tests', () => {
    it('should handle complete stream lifecycle', () => {
      // Process multiple chunks
      const chunk1 = streamEvent.parseChunk('data1');
      streamEvent.append(chunk1);
      const chunk2 = streamEvent.parseChunk('data2');
      streamEvent.append(chunk2);

      // Process buffer
      const messages = streamEvent.processBuffer();
      expect(messages).toEqual(['data1', 'data2']);

      // Add final chunk
      const chunk3 = streamEvent.parseChunk('data3');
      streamEvent.append(chunk3);

      // Complete stream
      const finalData = streamEvent.doned();
      expect(finalData).toBe('data3');
      expect(streamEvent.isFinished()).toBe(true);
      expect(streamEvent['bufferChunks']).toEqual([]);
    });

    it('should handle mixed data types in stream', () => {
      // String data
      streamEvent.append(streamEvent.parseChunk('text'));

      // Binary data
      const binaryData = new TextEncoder().encode('binary');
      streamEvent.append(streamEvent.parseChunk(binaryData));

      // Number data
      streamEvent.append(streamEvent.parseChunk(123));

      const messages = streamEvent.processBuffer();
      expect(messages).toEqual(['text', 'binary', '123']);
    });
  });
});
