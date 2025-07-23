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
});

class ColorHandler implements HandlerInterface {
  private formatter: FormatterInterface;

  constructor(formatter: FormatterInterface) {
    this.formatter = formatter;
  }

  setFormatter(formatter: FormatterInterface): void {
    this.formatter = formatter;
  }

  append(event: LogEvent): void {
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
});
