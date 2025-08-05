/**
 * SSEStreamProcessor test-suite
 *
 * Coverage:
 * 1. constructor       - Constructor tests
 * 2. processChunk     - Process chunk functionality tests
 * 3. processFinal     - Process final data tests
 * 4. edge cases       - Edge case tests
 */

import { describe, it, expect } from 'vitest';
import { SSEStreamProcessor } from '../../src/core/response-stream/SSEStreamProcessor';

describe('SSEStreamProcessor', () => {
  describe('constructor', () => {
    it('should create instance with default prefix', () => {
      const processor = new SSEStreamProcessor();
      expect(processor).toBeInstanceOf(SSEStreamProcessor);
    });

    it('should create instance with custom prefix', () => {
      const processor = new SSEStreamProcessor('custom: ');
      expect(processor).toBeInstanceOf(SSEStreamProcessor);
    });
  });

  describe('processChunk', () => {
    it('should process SSE data with default prefix', () => {
      const processor = new SSEStreamProcessor();
      const result = processor.processChunk(
        'data: message1\ndata: message2\ndata: message3'
      );
      expect(result).toEqual(['message1', 'message2', 'message3']);
    });

    it('should process SSE data with custom prefix', () => {
      const processor = new SSEStreamProcessor('custom: ');
      const result = processor.processChunk(
        'custom: message1\ncustom: message2\ncustom: message3'
      );
      expect(result).toEqual(['message1', 'message2', 'message3']);
    });

    it('should filter out non-prefixed lines', () => {
      const processor = new SSEStreamProcessor();
      const result = processor.processChunk(
        'data: message1\nother: data\ndata: message2'
      );
      expect(result).toEqual(['message1', 'message2']);
    });

    it('should trim messages', () => {
      const processor = new SSEStreamProcessor();
      const result = processor.processChunk(
        'data:  message1  \ndata:  message2  '
      );
      expect(result).toEqual(['message1', 'message2']);
    });
  });

  describe('processFinal', () => {
    it('should return last valid SSE message', () => {
      const processor = new SSEStreamProcessor();
      const result = processor.processFinal(
        'data: message1\ndata: message2\ndata: final'
      );
      expect(result).toBe('final');
    });

    it('should return undefined when no valid SSE messages', () => {
      const processor = new SSEStreamProcessor();
      expect(
        processor.processFinal('other: data\nno-prefix: message')
      ).toBeUndefined();
    });

    it('should handle custom prefix in final data', () => {
      const processor = new SSEStreamProcessor('custom: ');
      const result = processor.processFinal('custom: message1\ncustom: final');
      expect(result).toBe('final');
    });
  });

  describe('edge cases', () => {
    it('should handle empty chunk', () => {
      const processor = new SSEStreamProcessor();
      const result = processor.processChunk('');
      expect(result).toEqual([]);
    });

    it('should handle chunk with only newlines', () => {
      const processor = new SSEStreamProcessor();
      const result = processor.processChunk('\n\n\n');
      expect(result).toEqual([]);
    });

    it('should handle chunk with only whitespace', () => {
      const processor = new SSEStreamProcessor();
      const result = processor.processChunk('   \n  \n   ');
      expect(result).toEqual([]);
    });

    it('should handle partial prefix matches', () => {
      const processor = new SSEStreamProcessor();
      const result = processor.processChunk('dat: not-data\ndata: real-data');
      expect(result).toEqual(['real-data']);
    });
  });
});
