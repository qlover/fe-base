import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger } from '../src/Logger';
import { ConsoleHandler } from '../src/ConsoleHandler';
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
      const context = logger.context({ user: 'testUser', requestId: '123' });
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
      logger.info('critical message', logger.context({ level: 'critical' }));
      logger.info('important message', logger.context({ level: 'important' }));

      // Test with levels that should be filtered out
      logger.info('standard message', logger.context({ level: 'standard' }));
      logger.info('verbose message', logger.context({ level: 'verbose' }));

      // Verify the print method was called with the right levels
      expect(printSpy).toHaveBeenCalledTimes(4);

      // Verify that only messages with level important or higher were logged
      expect(mockHandler.events.length).toBe(2);

      printSpy.mockRestore();
    });
  });

  describe('integration with handlers and formatters', () => {
    it('should work with ConsoleHandler', () => {
      const consoleAppender = new ConsoleHandler();
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
      const consoleAppender = new ConsoleHandler(timestampFormatter);
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
      const consoleAppender = new ConsoleHandler();
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

  describe('appender management', () => {
    let logger: Logger;
    let mockHandler1: MockHandler;
    let mockHandler2: MockHandler;

    beforeEach(() => {
      mockHandler1 = new MockHandler();
      mockHandler2 = new MockHandler();
      logger = new Logger({ name: 'AppenderTestLogger' });
    });

    it('should add multiple appenders individually', () => {
      logger.addAppender(mockHandler1);
      logger.addAppender(mockHandler2);

      logger.info('test message');

      expect(mockHandler1.events).toHaveLength(1);
      expect(mockHandler2.events).toHaveLength(1);
    });
  });

  describe('formatter behavior', () => {
    class TestFormatter implements FormatterInterface {
      format(event: LogEvent): string[] {
        return [
          `[${event.loggerName}][${event.level}]`,
          ...(event.args as string[])
        ];
      }
    }

    class ContextFormatter implements FormatterInterface {
      format(event: LogEvent): string[] {
        if (event.context) {
          return [
            `[${event.level}]`,
            ...(event.args as string[]),
            JSON.stringify(event.context)
          ];
        }
        return [`[${event.level}]`, ...(event.args as string[])];
      }
    }

    it('should properly use custom formatter', () => {
      const testFormatter = new TestFormatter();
      const consoleAppender = new ConsoleHandler(testFormatter);
      const logger = new Logger({
        name: 'FormatterTestLogger',
        handlers: consoleAppender
      });

      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      logger.info('test message');

      expect(infoSpy).toHaveBeenCalledWith(
        '[FormatterTestLogger][info]',
        'test message'
      );

      infoSpy.mockRestore();
    });

    it('should format messages with context', () => {
      const contextFormatter = new ContextFormatter();
      const consoleAppender = new ConsoleHandler(contextFormatter);
      const logger = new Logger({
        name: 'ContextFormatterLogger',
        handlers: consoleAppender
      });

      const context = logger.context({ userId: '123', requestId: 'abc' });
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      logger.info('user action', context);

      expect(infoSpy).toHaveBeenCalledWith(
        '[info]',
        'user action',
        JSON.stringify(context)
      );

      infoSpy.mockRestore();
    });

    it('should chain multiple formatters if supported', () => {
      class ChainFormatter implements FormatterInterface {
        constructor(private nextFormatter: FormatterInterface) {}

        format(event: LogEvent): string[] {
          const formatted = this.nextFormatter.format(event) as string[];
          return [`CHAIN-${formatted[0]}`, ...formatted.slice(1)];
        }
      }

      const baseFormatter = new TestFormatter();
      const chainFormatter = new ChainFormatter(baseFormatter);
      const consoleAppender = new ConsoleHandler(chainFormatter);

      const logger = new Logger({
        name: 'ChainLogger',
        handlers: consoleAppender
      });

      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

      logger.info('chain message');

      expect(infoSpy).toHaveBeenCalledWith(
        'CHAIN-[ChainLogger][info]',
        'chain message'
      );

      infoSpy.mockRestore();
    });
  });

  describe('appender error handling', () => {
    class ErrorAppender implements HandlerInterface {
      formatter: FormatterInterface | null = null;

      append(): void {
        throw new Error('Appender error');
      }

      setFormatter(formatter: FormatterInterface): void {
        this.formatter = formatter;
      }
    }

    it('should handle errors in appenders gracefully', () => {
      const errorAppender = new ErrorAppender();
      const mockHandler = new MockHandler();
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const logger = new Logger({
        name: 'ErrorLogger',
        handlers: [errorAppender, mockHandler]
      });

      try {
        logger.info('test message');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }

      consoleSpy.mockRestore();
    });
  });
});
