import { ConsoleHandler } from '../src/ConsoleHandler';
import { TimestampFormatter } from '../src/TimestampFormatter';
import { LogEvent } from '../src/interface/LogEvent';
import type { FormatterInterface } from '../src/interface/FormatterInterface';

describe('ConsoleHandler', () => {
  // Setup mocks for console methods
  beforeEach(() => {
    // Mock all console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'trace').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should append log event without formatter', () => {
    const appender = new ConsoleHandler();
    const event = new LogEvent('info', ['Test message'], 'testLogger');

    appender.append(event);

    // Verify that console.info was called with our message
    expect(console.info).toHaveBeenCalledWith('Test message');
  });

  it('should append log event with multiple arguments', () => {
    const appender = new ConsoleHandler();
    const event = new LogEvent(
      'debug',
      ['Debug', 123, { foo: 'bar' }],
      'testLogger'
    );

    appender.append(event);

    // Verify that console.debug was called with our arguments
    expect(console.debug).toHaveBeenCalledWith('Debug', 123, { foo: 'bar' });
  });

  it('should use formatter when provided', () => {
    const formatter = new TimestampFormatter();
    const appender = new ConsoleHandler(formatter);
    const event = new LogEvent('warn', ['Warning message'], 'testLogger');
    const timestamp = event.timestamp;

    appender.append(event);

    // Get formatted timestamp
    const formattedTimestamp = new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    });

    // Verify that console.warn was called with formatted output
    expect(console.warn).toHaveBeenCalledWith(
      `[${formattedTimestamp} warn]`,
      'Warning message'
    );
  });

  it('should handle non-array formatter output', () => {
    // Create a custom formatter that returns a string instead of an array
    const customFormatter: FormatterInterface = {
      format: () => 'Formatted message'
    };

    const appender = new ConsoleHandler(customFormatter);
    const event = new LogEvent('error', ['Original message'], 'testLogger');

    appender.append(event);

    // Verify that console.error was called with the string from the formatter
    expect(console.error).toHaveBeenCalledWith('Formatted message');
  });

  it('should set formatter via setFormatter method', () => {
    const appender = new ConsoleHandler();
    const formatter = new TimestampFormatter();

    appender.setFormatter(formatter);

    const event = new LogEvent('info', ['Test message'], 'testLogger');
    const timestamp = event.timestamp;

    appender.append(event);

    // Get formatted timestamp
    const formattedTimestamp = new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    });

    // Verify that console.info was called with formatted output
    expect(console.info).toHaveBeenCalledWith(
      `[${formattedTimestamp} info]`,
      'Test message'
    );
  });

  it('should handle all log levels', () => {
    const appender = new ConsoleHandler();
    const logLevels = [
      'log',
      'info',
      'error',
      'warn',
      'debug',
      'trace'
    ] as const;

    for (const level of logLevels) {
      const event = new LogEvent(level, [`${level} message`], 'testLogger');
      appender.append(event);

      // Verify the correct console method was called
      expect(console[level]).toHaveBeenCalledWith(`${level} message`);
    }
  });
});
