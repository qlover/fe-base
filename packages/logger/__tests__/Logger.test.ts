import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger } from '../src/Logger';
import { ConsoleAppender } from '../src/ConsoleAppender';
import { TimestampFormatter } from '../src/TimestampFormatter';
import { LogEvent } from '../src/interface/LogEvent';
import { HandlerInterface } from '../src/interface/HandlerInterface';
import { FormatterInterface } from '../src/interface/FormatterInterface';

describe('Logger', () => {
  // Create a mock handler for testing
  class MockHandler implements HandlerInterface {
    public events: LogEvent[] = [];
    public formatter: FormatterInterface | null = null;

    append(event: LogEvent): void {
      this.events.push(event);
    }

    setFormatter(formatter: FormatterInterface): void {
      this.formatter = formatter;
    }
  }

  let mockHandler: MockHandler;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockHandler = new MockHandler();
    consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default name if none provided', () => {
      const dateSpy = vi.spyOn(Date, 'now').mockReturnValue(12345);
      const logger = new Logger();

      logger.info('test');
      expect(mockHandler.events).toHaveLength(0); // No handler added yet

      logger.addAppender(mockHandler);
      logger.info('test');

      expect(mockHandler.events).toHaveLength(1);
      expect(mockHandler.events[0].loggerName).toBe('12345');

      dateSpy.mockRestore();
    });

    it('should initialize with provided name', () => {
      const logger = new Logger({ name: 'TestLogger' });
      logger.addAppender(mockHandler);
      logger.info('test');

      expect(mockHandler.events).toHaveLength(1);
      expect(mockHandler.events[0].loggerName).toBe('TestLogger');
    });

    it('should initialize with a single handler', () => {
      const logger = new Logger({ name: 'TestLogger', handlers: mockHandler });
      logger.info('test');

      expect(mockHandler.events).toHaveLength(1);
    });

    it('should initialize with multiple handlers', () => {
      const mockHandler2 = new MockHandler();
      const logger = new Logger({
        name: 'TestLogger',
        handlers: [mockHandler, mockHandler2]
      });
      logger.info('test');

      expect(mockHandler.events).toHaveLength(1);
      expect(mockHandler2.events).toHaveLength(1);
    });
  });

  describe('addAppender', () => {
    it('should add an appender', () => {
      const logger = new Logger();
      logger.info('before');

      logger.addAppender(mockHandler);
      logger.info('after');

      expect(mockHandler.events).toHaveLength(1);
      expect(mockHandler.events[0].args).toEqual(['after']);
    });
  });

  describe('logging methods', () => {
    let logger: Logger;

    beforeEach(() => {
      logger = new Logger({ name: 'TestLogger', handlers: mockHandler });
    });

    it('should log with the info level using log()', () => {
      logger.log('test message');

      expect(mockHandler.events).toHaveLength(1);
      expect(mockHandler.events[0].level).toBe('info');
      expect(mockHandler.events[0].args).toEqual(['test message']);
    });

    it('should log with the fatal level', () => {
      logger.fatal('fatal message');

      expect(mockHandler.events).toHaveLength(1);
      expect(mockHandler.events[0].level).toBe('fatal');
      expect(mockHandler.events[0].args).toEqual(['fatal message']);
    });

    it('should log with the error level', () => {
      logger.error('error message');

      expect(mockHandler.events).toHaveLength(1);
      expect(mockHandler.events[0].level).toBe('error');
      expect(mockHandler.events[0].args).toEqual(['error message']);
    });

    it('should log with the warn level', () => {
      logger.warn('warn message');

      expect(mockHandler.events).toHaveLength(1);
      expect(mockHandler.events[0].level).toBe('warn');
      expect(mockHandler.events[0].args).toEqual(['warn message']);
    });

    it('should log with the info level', () => {
      logger.info('info message');

      expect(mockHandler.events).toHaveLength(1);
      expect(mockHandler.events[0].level).toBe('info');
      expect(mockHandler.events[0].args).toEqual(['info message']);
    });

    it('should log with the debug level', () => {
      logger.debug('debug message');

      expect(mockHandler.events).toHaveLength(1);
      expect(mockHandler.events[0].level).toBe('debug');
      expect(mockHandler.events[0].args).toEqual(['debug message']);
    });

    it('should log with the trace level', () => {
      logger.trace('trace message');

      expect(mockHandler.events).toHaveLength(1);
      expect(mockHandler.events[0].level).toBe('trace');
      expect(mockHandler.events[0].args).toEqual(['trace message']);
    });

    it('should handle multiple arguments', () => {
      logger.info('first', 'second', 123);

      expect(mockHandler.events).toHaveLength(1);
      expect(mockHandler.events[0].args).toEqual(['first', 'second', 123]);
    });
  });

  describe('context handling', () => {
    let logger: Logger;

    beforeEach(() => {
      logger = new Logger({ name: 'TestLogger', handlers: mockHandler });
    });

    it('should recognize an object as context when it is the last argument', () => {
      const context = { user: 'testUser', requestId: '123' };
      logger.info('message with context', context);

      expect(mockHandler.events).toHaveLength(1);
      expect(mockHandler.events[0].args).toEqual(['message with context']);
      expect(mockHandler.events[0].context).toEqual(context);
    });

    it('should treat last argument as regular arg if it is not an object', () => {
      logger.info('message', 123);

      expect(mockHandler.events).toHaveLength(1);
      expect(mockHandler.events[0].args).toEqual(['message', 123]);
      expect(mockHandler.events[0].context).toBeUndefined();
    });

    it('should treat null as a regular argument', () => {
      logger.info('message', null);

      expect(mockHandler.events).toHaveLength(1);
      expect(mockHandler.events[0].args).toEqual(['message', null]);
      expect(mockHandler.events[0].context).toBeUndefined();
    });
  });

  describe('log level filtering', () => {
    it('should respect the configured log level', () => {
      // Configure logger to only log warn and higher
      const logger = new Logger({
        name: 'TestLogger',
        handlers: mockHandler,
        level: 'warn'
      });

      logger.trace('trace message');
      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');
      logger.fatal('fatal message');

      // Only warn, error, and fatal should be logged
      expect(mockHandler.events).toHaveLength(3);
      expect(mockHandler.events[0].level).toBe('warn');
      expect(mockHandler.events[1].level).toBe('error');
      expect(mockHandler.events[2].level).toBe('fatal');
    });

    it('should work with custom levels', () => {
      const customLevels = {
        critical: 0,
        important: 1,
        standard: 2,
        verbose: 3
      };

      // Create a logger with custom levels
      const logger = new Logger({
        name: 'CustomLevelLogger',
        handlers: mockHandler,
        levels: customLevels,
        level: 'important'
      });

      // Mock the print method to handle custom levels
      // @ts-expect-error
      const printSpy = vi.spyOn(Logger.prototype, 'print');

      // Test with levels that should be logged
      logger.info('critical message', { level: 'critical' });
      logger.info('important message', { level: 'important' });

      // Test with levels that should be filtered out
      logger.info('standard message', { level: 'standard' });
      logger.info('verbose message', { level: 'verbose' });

      // Verify the print method was called with the right levels
      expect(printSpy).toHaveBeenCalledTimes(4);

      // Verify that only messages with level important or higher were logged
      expect(mockHandler.events.length).toBe(2);

      printSpy.mockRestore();
    });
  });

  describe('integration with handlers and formatters', () => {
    it('should work with ConsoleAppender', () => {
      const consoleAppender = new ConsoleAppender();
      const logger = new Logger({
        name: 'TestLogger',
        handlers: consoleAppender
      });

      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      logger.info('info message');
      logger.error('error message');
      logger.warn('warn message');

      expect(infoSpy).toHaveBeenCalledWith('info message');
      expect(errorSpy).toHaveBeenCalledWith('error message');
      expect(warnSpy).toHaveBeenCalledWith('warn message');

      infoSpy.mockRestore();
      errorSpy.mockRestore();
      warnSpy.mockRestore();
    });

    it('should work with TimestampFormatter', () => {
      const timestampFormatter = new TimestampFormatter({ locale: 'en-US' });
      const consoleAppender = new ConsoleAppender(timestampFormatter);
      const logger = new Logger({
        name: 'TestLogger',
        handlers: consoleAppender
      });

      const mockDate = new Date('2023-01-01T12:00:00Z');
      const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime());

      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      logger.info('message');

      expect(infoSpy).toHaveBeenCalledWith('[12:00:00 info]', 'message');

      // dateSpy.mockRestore();
      infoSpy.mockRestore();
      nowSpy.mockRestore();
    });

    it('should allow setting formatter after initialization', () => {
      const consoleAppender = new ConsoleAppender();
      const logger = new Logger({
        name: 'TestLogger',
        handlers: consoleAppender
      });
      const timestampFormatter = new TimestampFormatter({ locale: 'en-US' });

      consoleAppender.setFormatter(timestampFormatter);

      const mockDate = new Date('2023-01-01T12:00:00Z');
      const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime());
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      logger.info('message');

      expect(infoSpy).toHaveBeenCalledWith('[12:00:00 info]', 'message');

      nowSpy.mockRestore();
      infoSpy.mockRestore();
    });
  });

  describe('timestamp management', () => {
    it('should set timestamp on the log event', () => {
      const logger = new Logger({ name: 'TestLogger', handlers: mockHandler });
      const mockTimestamp = 1609459200000; // 2021-01-01T00:00:00.000Z

      vi.spyOn(Date, 'now').mockReturnValue(mockTimestamp);

      logger.info('test message');

      expect(mockHandler.events[0].timestamp).toBe(mockTimestamp);

      vi.restoreAllMocks();
    });
  });

  describe('silent mode', () => {
    it('should not log messages when silent mode is enabled', () => {
      const logger = new Logger({
        name: 'TestLogger',
        handlers: mockHandler,
        silent: true
      });
      logger.info('test message');
      expect(mockHandler.events).toHaveLength(0);
    });
  });
});
