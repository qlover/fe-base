/**
 * LineStreamProcessor test-suite
 *
 * Coverage:
 * 1. constructor       - Constructor tests
 * 2. processChunk     - Process chunk functionality tests
 * 3. processFinal     - Process final data tests
 * 4. edge cases       - Edge case tests
 */

import { describe, it, expect } from 'vitest';
import { LineStreamProcessor } from '../../src/core/response-stream/LineStreamProcessor';

describe('LineStreamProcessor', () => {
  describe('constructor', () => {
    it('should create instance with default separator', () => {
      const processor = new LineStreamProcessor();
      expect(processor).toBeInstanceOf(LineStreamProcessor);
    });

    it('should create instance with custom separator', () => {
      const processor = new LineStreamProcessor('|');
      expect(processor).toBeInstanceOf(LineStreamProcessor);
    });
  });

  describe('processChunk', () => {
    it('should split chunk by default separator and trim lines', () => {
      const processor = new LineStreamProcessor();
      const result = processor.processChunk('message1\n  message2  \nmessage3');
      expect(result).toEqual(['message1', 'message2', 'message3']);
    });

    it('should split chunk by custom separator', () => {
      const processor = new LineStreamProcessor('|');
      const result = processor.processChunk('message1|  message2  |message3');
      expect(result).toEqual(['message1', 'message2', 'message3']);
    });

    it('should filter out empty lines', () => {
      const processor = new LineStreamProcessor();
      const result = processor.processChunk('message1\n\n  \nmessage2');
      expect(result).toEqual(['message1', 'message2']);
    });
  });

  describe('processFinal', () => {
    it('should return trimmed data if not empty', () => {
      const processor = new LineStreamProcessor();
      const result = processor.processFinal('  final data  ');
      expect(result).toBe('final data');
    });

    it('should return undefined for empty data', () => {
      const processor = new LineStreamProcessor();
      expect(processor.processFinal('')).toBeUndefined();
      expect(processor.processFinal('   ')).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty chunk', () => {
      const processor = new LineStreamProcessor();
      const result = processor.processChunk('');
      expect(result).toEqual([]);
    });

    it('should handle chunk with only separators', () => {
      const processor = new LineStreamProcessor();
      const result = processor.processChunk('\n\n\n');
      expect(result).toEqual([]);
    });

    it('should handle chunk with only whitespace', () => {
      const processor = new LineStreamProcessor();
      const result = processor.processChunk('   \n  \n   ');
      expect(result).toEqual([]);
    });
  });
});
