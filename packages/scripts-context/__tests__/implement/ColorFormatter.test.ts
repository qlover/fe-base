import { ColorFormatter } from '../../src/implement/ColorFormatter';
import {
  Logger,
  HandlerInterface,
  LogEvent,
  FormatterInterface
} from '@qlover/logger';
import chalk from 'chalk';

describe('ColorFormatter', () => {
  let formatter: ColorFormatter;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    formatter = new ColorFormatter();
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('format', () => {
    it('should handle normal strings correctly', () => {
      const event = new LogEvent('info', ['Hello World'], 'test');
      const result = formatter.format(event);

      expect(result[0]).toMatch('INFO');
      expect(result[1]).toBe('Hello World');
    });

    it('should handle multiple arguments correctly', () => {
      const event = new LogEvent('info', ['This is', 'a test', 123], 'test');

      const result = formatter.format(event);
      expect(result[0]).toMatch('INFO');
      expect(result.slice(1)).toEqual(['This is', 'a test', 123]);
    });

    it('should handle non-string first argument', () => {
      const event = new LogEvent('info', [123, 'test'], 'test');
      const result = formatter.format(event);
      expect(result[0]).toMatch('INFO');
      expect(result.slice(1)).toEqual([123, 'test']);
    });

    it('should handle undefined log level color', () => {
      const event = new LogEvent('custom', ['Custom level'], 'test');
      const result = formatter.format(event);
      expect(result[0]).toMatch('CUSTOM');
      expect(result[1]).toBe('Custom level');
    });
  });

  it('should use custom colors', () => {
    const customColorFn = chalk.magenta;
    const customFormatter = new ColorFormatter({
      info: customColorFn
    });

    const event = new LogEvent('info', ['Custom Color'], 'test');
    const result = customFormatter.format(event);

    expect(result[0]).toMatch('INFO');
    expect(result[1]).toBe('Custom Color');
  });

  it('should handle different log levels correctly', () => {
    const levels = [
      'fatal',
      'error',
      'warn',
      'info',
      'debug',
      'trace',
      'log'
    ] as const;

    levels.forEach((level) => {
      const event = new LogEvent(level, [`${level} message`], 'test');
      const result = formatter.format(event);

      expect(result[0]).toMatch(level === 'log' ? 'LOG' : level.toUpperCase());
      expect(result[1]).toBe(`${level} message`);
    });
  });

  it('should handle empty arguments array', () => {
    const event = new LogEvent('info', [], 'test');
    const result = formatter.format(event);

    expect(result[0]).toMatch('INFO');
    expect(result.length).toBe(1);
  });

  it('should handle object arguments', () => {
    const obj = { key: 'value', nested: { prop: 'data' } };
    const event = new LogEvent('info', [obj], 'test');
    const result = formatter.format(event);

    expect(result[0]).toMatch('INFO');
    expect(result[1]).toBe(obj);
  });

  it('should handle null and undefined arguments', () => {
    const event = new LogEvent('info', [null, undefined, 'message'], 'test');
    const result = formatter.format(event);

    expect(result[0]).toMatch('INFO');
    expect(result[1]).toBe(null);
    expect(result[2]).toBe(undefined);
    expect(result[3]).toBe('message');
  });

  it('should handle boolean arguments', () => {
    const event = new LogEvent('info', [true, false], 'test');
    const result = formatter.format(event);

    expect(result[0]).toMatch('INFO');
    expect(result[1]).toBe(true);
    expect(result[2]).toBe(false);
  });

  it('should handle number arguments', () => {
    const event = new LogEvent('info', [0, 42, -10, 3.14], 'test');
    const result = formatter.format(event);

    expect(result[0]).toMatch('INFO');
    expect(result.slice(1)).toEqual([0, 42, -10, 3.14]);
  });

  it('should handle mixed type arguments', () => {
    const event = new LogEvent(
      'info',
      ['string', 123, true, { obj: 'value' }, null],
      'test'
    );
    const result = formatter.format(event);

    expect(result[0]).toMatch('INFO');
    expect(result.slice(1)).toEqual([
      'string',
      123,
      true,
      { obj: 'value' },
      null
    ]);
  });

  it('should preserve Error objects', () => {
    const error = new Error('Test error');
    const event = new LogEvent('error', ['Operation failed', error], 'test');
    const result = formatter.format(event);

    expect(result[0]).toMatch('ERROR');
    expect(result[1]).toBe('Operation failed');
    expect(result[2]).toBe(error);
  });

  it('should handle string color function', () => {
    const customFormatter = new ColorFormatter({
      info: 'blue' // String instead of function
    });

    const event = new LogEvent('info', ['Test message'], 'test');
    const result = customFormatter.format(event);

    expect(result[0]).toMatch('INFO');
    expect(result[1]).toBe('Test message');
  });

  it('should handle very long messages', () => {
    const longMessage = 'A'.repeat(10000);
    const event = new LogEvent('info', [longMessage], 'test');
    const result = formatter.format(event);

    expect(result[0]).toMatch('INFO');
    expect(result[1]).toBe(longMessage);
  });

  it('should handle special characters in messages', () => {
    const specialChars = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/\\`~';
    const event = new LogEvent('info', [specialChars], 'test');
    const result = formatter.format(event);

    expect(result[0]).toMatch('INFO');
    expect(result[1]).toBe(specialChars);
  });

  it('should handle unicode characters', () => {
    const unicode = '你好世界 🌍 مرحبا العالم';
    const event = new LogEvent('info', [unicode], 'test');
    const result = formatter.format(event);

    expect(result[0]).toMatch('INFO');
    expect(result[1]).toBe(unicode);
  });
});

class ColorHandler implements HandlerInterface {
  private formatter: FormatterInterface;

  constructor(formatter: FormatterInterface) {
    this.formatter = formatter;
  }

  /**
   * @override
   */
  public setFormatter(formatter: FormatterInterface): void {
    this.formatter = formatter;
  }

  /**
   * @override
   */
  public append(event: LogEvent): void {
    const formattedArgs = this.formatter.format(event);
    if (Array.isArray(formattedArgs)) {
      console.log(...formattedArgs);
    } else {
      console.log(formattedArgs);
    }
  }
}

describe('Logger with ColorFormatter', () => {
  let logger: Logger;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logger = new Logger({
      name: 'test',
      level: 'debug',
      handlers: new ColorHandler(new ColorFormatter())
    });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should format normal logs correctly', () => {
    logger.info('Hello World');
    const calls = consoleSpy.mock.calls;
    const lastCall = calls[calls.length - 1];

    expect(lastCall[0]).toMatch('INFO');
    expect(lastCall[1]).toBe('Hello World');
  });

  it('should handle multiple parameters correctly', () => {
    logger.info('Multiple', 'parameters', 'test', 123, true);
    const calls = consoleSpy.mock.calls;
    const lastCall = calls[calls.length - 1];

    expect(lastCall[0]).toMatch('INFO');
    expect(lastCall.slice(1)).toEqual([
      'Multiple',
      'parameters',
      'test',
      123,
      true
    ]);
  });

  it('should handle custom color configurations correctly', () => {
    const customColorFn = chalk.magenta;
    const customLogger = new Logger({
      name: 'test',
      level: 'debug',
      handlers: new ColorHandler(
        new ColorFormatter({
          info: customColorFn
        })
      )
    });

    customLogger.info('Custom Color');
    const calls = consoleSpy.mock.calls;
    const lastCall = calls[calls.length - 1];

    expect(lastCall[0]).toMatch('INFO');
    expect(lastCall[1]).toBe('Custom Color');
  });

  it('should handle non-string first argument correctly', () => {
    logger.info(123, 'test');
    const calls = consoleSpy.mock.calls;
    const lastCall = calls[calls.length - 1];

    expect(lastCall[0]).toMatch('INFO');
    expect(lastCall[1]).toBe(123);
    expect(lastCall[2]).toBe('test');
  });

  it('should handle different log levels correctly', () => {
    const levels = ['fatal', 'error', 'warn', 'info', 'debug', 'log'] as const;

    levels.forEach((level) => {
      logger[level](`${level} message`);

      const calls = consoleSpy.mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0]).toMatch(
        level === 'log' ? 'INFO' : level.toUpperCase()
      );
      expect(lastCall[1]).toBe(`${level} message`);
    });
  });

  it('should handle logs with context correctly', () => {
    const context = { userId: 123, role: 'admin' };
    logger.info('User logged in', context);

    const calls = consoleSpy.mock.calls;
    const lastCall = calls[calls.length - 1];
    expect(lastCall[0]).toMatch('INFO');
    expect(lastCall[1]).toBe('User logged in');
    expect(lastCall[2]).toBe(context);
  });

  it('should handle error objects correctly', () => {
    const error = new Error('Something went wrong');
    logger.error('Operation failed', error);

    const calls = consoleSpy.mock.calls;
    const lastCall = calls[calls.length - 1];
    expect(lastCall[0]).toMatch('ERROR');
    expect(lastCall[1]).toBe('Operation failed');
    expect(lastCall[2]).toBe(error);
  });

  it('should handle empty log messages', () => {
    logger.info();

    const calls = consoleSpy.mock.calls;
    const lastCall = calls[calls.length - 1];
    expect(lastCall[0]).toMatch('INFO');
  });

  it('should handle very long messages in logger', () => {
    const longMessage = 'A'.repeat(10000);
    logger.info(longMessage);

    const calls = consoleSpy.mock.calls;
    const lastCall = calls[calls.length - 1];
    expect(lastCall[0]).toMatch('INFO');
    expect(lastCall[1]).toBe(longMessage);
  });

  it('should handle mixed arguments in logger', () => {
    logger.info('Message', 123, true, { key: 'value' }, null, undefined);

    const calls = consoleSpy.mock.calls;
    const lastCall = calls[calls.length - 1];
    expect(lastCall[0]).toMatch('INFO');
    expect(lastCall.slice(1)).toEqual([
      'Message',
      123,
      true,
      { key: 'value' },
      null,
      undefined
    ]);
  });

  it('should handle trace level correctly', () => {
    const traceLogger = new Logger({
      name: 'test',
      level: 'trace',
      handlers: new ColorHandler(new ColorFormatter())
    });

    traceLogger.trace('Trace message');

    const calls = consoleSpy.mock.calls;
    const lastCall = calls[calls.length - 1];
    expect(lastCall[0]).toMatch('TRACE');
    expect(lastCall[1]).toBe('Trace message');
  });

  it('should handle fatal level correctly', () => {
    logger.fatal('Fatal error occurred');

    const calls = consoleSpy.mock.calls;
    const lastCall = calls[calls.length - 1];
    expect(lastCall[0]).toMatch('FATAL');
    expect(lastCall[1]).toBe('Fatal error occurred');
  });

  it('should maintain color consistency across multiple logs', () => {
    logger.error('Error 1');
    logger.error('Error 2');
    logger.info('Info 1');
    logger.info('Info 2');

    const calls = consoleSpy.mock.calls;
    const errorCalls = calls.filter(
      (call) =>
        typeof call[0] === 'string' && call[0].toString().includes('ERROR')
    );
    const infoCalls = calls.filter(
      (call) => typeof call[0] === 'string' && call[0].toString().includes('INFO')
    );

    expect(errorCalls.length).toBeGreaterThanOrEqual(2);
    expect(infoCalls.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle array arguments in logger', () => {
    const arr = [1, 2, 3, 4, 5];
    logger.info('Array data:', arr);

    const calls = consoleSpy.mock.calls;
    const lastCall = calls[calls.length - 1];
    expect(lastCall[0]).toMatch('INFO');
    expect(lastCall[1]).toBe('Array data:');
    expect(lastCall[2]).toBe(arr);
  });

  it('should handle nested objects in logger', () => {
    const nested = {
      level1: {
        level2: {
          level3: {
            value: 'deep'
          }
        }
      }
    };
    logger.info('Nested object:', nested);

    const calls = consoleSpy.mock.calls;
    const lastCall = calls[calls.length - 1];
    expect(lastCall[0]).toMatch('INFO');
    expect(lastCall[1]).toBe('Nested object:');
    expect(lastCall[2]).toBe(nested);
  });

  it('should handle function arguments in logger', () => {
    const fn = () => 'test';
    logger.info('Function:', fn);

    const calls = consoleSpy.mock.calls;
    const lastCall = calls[calls.length - 1];
    expect(lastCall[0]).toMatch('INFO');
    expect(lastCall[1]).toBe('Function:');
    expect(lastCall[2]).toBe(fn);
  });

  it('should handle symbol arguments in logger', () => {
    const sym = Symbol('test');
    logger.info('Symbol:', sym);

    const calls = consoleSpy.mock.calls;
    const lastCall = calls[calls.length - 1];
    expect(lastCall[0]).toMatch('INFO');
    expect(lastCall[1]).toBe('Symbol:');
    expect(lastCall[2]).toBe(sym);
  });
});
