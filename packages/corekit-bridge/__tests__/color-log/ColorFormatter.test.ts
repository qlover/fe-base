import { ColorFormatter } from '../../src/core/color-log/ColorFormatter';
import {
  Logger,
  HandlerInterface,
  LogEvent,
  FormatterInterface,
  ConsoleHandler,
  LogContext
} from '@qlover/logger';

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

  it('should handle normal strings correctly', () => {
    const event = new LogEvent('info', ['Hello World'], 'test');
    const result = formatter.format(event);

    expect(result).toEqual([
      '%cINFO%c Hello World',
      'color: #0000ff',
      'color: inherit; background: inherit; fontWeight: normal; fontStyle: normal; textDecoration: none'
    ]);
  });

  it('should handle strings with %c correctly', () => {
    const event = new LogEvent(
      'info',
      [
        'This is %cRed%c and %cBlue%c text',
        'color: red',
        'color: inherit',
        'color: blue',
        'color: inherit'
      ],
      'test'
    );

    const result = formatter.format(event);
    expect(result).toEqual(event.args);
  });

  it('should handle color segments correctly', () => {
    const event = new LogEvent(
      'info',
      ['Hello World'],
      'test',
      new LogContext([
        { text: 'Hello', style: { color: 'red', fontWeight: 'bold' } },
        { text: ' World', style: { color: 'blue', background: '#f0f0f0' } }
      ])
    );

    const result = formatter.format(event);
    expect(result).toEqual([
      '%cHello%c%c World%c',
      'color: red; fontWeight: bold',
      'color: inherit; background: inherit; fontWeight: normal; fontStyle: normal; textDecoration: none',
      'color: blue; background: #f0f0f0',
      'color: inherit; background: inherit; fontWeight: normal; fontStyle: normal; textDecoration: none'
    ]);
  });

  it('should use custom colors', () => {
    const customFormatter = new ColorFormatter({
      info: { color: '#ff00ff', fontWeight: 'bold' }
    });

    const event = new LogEvent('info', ['Custom Color'], 'test');
    const result = customFormatter.format(event);

    expect(result).toEqual([
      '%cINFO%c Custom Color',
      'color: #ff00ff; fontWeight: bold',
      'color: inherit; background: inherit; fontWeight: normal; fontStyle: normal; textDecoration: none'
    ]);
  });

  it('should handle different log levels correctly', () => {
    const levels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'log'];

    levels.forEach((level) => {
      const event = new LogEvent(level, [`${level} message`], 'test');
      const result = formatter.format(event);

      expect(result[0]).toContain(level.toUpperCase());
      expect(result).toHaveLength(3); // text + two styles
    });
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
      console.log(formattedArgs[0], ...formattedArgs.slice(1));
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

    expect(consoleSpy).toHaveBeenCalledWith(
      '%cINFO%c Hello World',
      'color: #0000ff',
      'color: inherit; background: inherit; fontWeight: normal; fontStyle: normal; textDecoration: none'
    );
  });

  it('should handle strings with %c correctly', () => {
    logger.info(
      'This is %cRed%c and %cBlue%c text',
      'color: red',
      'color: inherit',
      'color: blue',
      'color: inherit'
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'This is %cRed%c and %cBlue%c text',
      'color: red',
      'color: inherit',
      'color: blue',
      'color: inherit'
    );
  });

  it('should handle color segments correctly', () => {
    logger.info(
      'Hello World',
      logger.context([
        { text: 'Hello', style: { color: 'red', fontWeight: 'bold' } },
        { text: ' World', style: { color: 'blue', background: '#f0f0f0' } }
      ])
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      '%cHello%c%c World%c',
      'color: red; fontWeight: bold',
      'color: inherit; background: inherit; fontWeight: normal; fontStyle: normal; textDecoration: none',
      'color: blue; background: #f0f0f0',
      'color: inherit; background: inherit; fontWeight: normal; fontStyle: normal; textDecoration: none'
    );
  });

  it('should handle different log levels correctly', () => {
    const levels = [
      'fatal',
      'error',
      'warn',
      'info',
      'debug',
      // 'trace',
      'log'
    ] as const;

    levels.forEach((level) => {
      logger[level](`${level} message`);

      const calls = consoleSpy.mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0]).toContain(level);
      expect(lastCall).toHaveLength(3);
      expect(lastCall[0]).toContain(`${level} message`);
    });
  });

  it('should handle logs with not context correctly', () => {
    const context = { userId: 123, role: 'admin' };
    logger.info('User logged in', context);

    expect(consoleSpy).toHaveBeenCalledWith(
      '%cINFO%c User logged in',
      'color: #0000ff',
      'color: inherit; background: inherit; fontWeight: normal; fontStyle: normal; textDecoration: none',
      context
    );
  });

  it('should handle error objects correctly', () => {
    const error = new Error('Something went wrong');
    logger.error('Operation failed', error);

    expect(consoleSpy).toHaveBeenCalledWith(
      '%cERROR%c Operation failed',
      'color: #ff0000',
      'color: inherit; background: inherit; fontWeight: normal; fontStyle: normal; textDecoration: none',
      error
    );
  });

  it('should handle multiple parameters correctly', () => {
    logger.info('Multiple', 'parameters', 'test', 123, true);

    expect(consoleSpy).toHaveBeenCalledWith(
      '%cINFO%c Multiple',
      'color: #0000ff',
      'color: inherit; background: inherit; fontWeight: normal; fontStyle: normal; textDecoration: none',
      'parameters',
      'test',
      123,
      true
    );
  });

  it('should handle custom color configurations correctly', () => {
    const customLogger = new Logger({
      name: 'test',
      level: 'debug',
      handlers: new ConsoleHandler(
        new ColorFormatter({
          info: { color: '#ff00ff', fontWeight: 'bold' }
        })
      )
    });

    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    customLogger.info('Custom color message');

    expect(consoleSpy).toHaveBeenCalledWith(
      '%cINFO%c Custom color message',
      'color: #ff00ff; fontWeight: bold',
      'color: inherit; background: inherit; fontWeight: normal; fontStyle: normal; textDecoration: none'
    );
  });
});
