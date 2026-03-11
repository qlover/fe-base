import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { LoggerInterface } from '@qlover/logger';
import { ReflectionIOCContainer } from '../../src/core/ioc/ReflectionIOCContainer';
function createMockLogger(): LoggerInterface {
  return {
    log: vi.fn(),
    fatal: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
    addAppender: vi.fn(),
    context: vi.fn()
  } as unknown as LoggerInterface;
}

describe('ReflectionIOCContainer', () => {
  let container: ReflectionIOCContainer;
  let mockLogger: LoggerInterface;

  beforeEach(() => {
    mockLogger = createMockLogger();
    container = new ReflectionIOCContainer(mockLogger);
  });

  describe('constructor', () => {
    it('should create instance', () => {
      expect(container).toBeInstanceOf(ReflectionIOCContainer);
    });
  });

  describe('bind and get', () => {
    it('should bind and get value', () => {
      container.bind('key', 'value');
      expect(container.get<string>('key')).toBe('value');
    });

    it('should return same instance for bound class (singleton)', () => {
      class Service {
        public id = 1;
      }
      container.bind('svc', Service);
      const a = container.get<Service>('svc');
      const b = container.get<Service>('svc');
      expect(a).toBe(b);
      expect(a).toBeInstanceOf(Service);
    });
  });

  describe('bindFactory', () => {
    it('should use factory and cache result', () => {
      let count = 0;
      container.bindFactory('counter', () => ++count);
      expect(container.get<number>('counter')).toBe(1);
      expect(container.get<number>('counter')).toBe(1);
    });
  });

  describe('reset', () => {
    it('should clear after reset', () => {
      container.bind('a', 1);
      container.get('a');
      container.reset();
      expect(() => container.get('a')).toThrow('No binding found for a');
    });
  });
});
