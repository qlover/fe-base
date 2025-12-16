import { TimestampFormatter, DateFormatType } from '../src/TimestampFormatter';
import { LogEvent } from '../src/interface/LogEvent';
import { LogContext } from '../src/interface/LogContext';

describe('TimestampFormatter', () => {
  const TEST_TIMESTAMP = 1634567890123;

  it('should format with default settings (datetime)', () => {
    const formatter = new TimestampFormatter();
    const event = new LogEvent('info', ['Test message'], 'testLogger');
    event.timestamp = TEST_TIMESTAMP;

    const formattedOutput = formatter.format(event);

    const expectedTimestamp = new Date(TEST_TIMESTAMP).toLocaleString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    });

    expect(formattedOutput[0]).toBe(`[${expectedTimestamp} info]`);
    expect(formattedOutput[1]).toBe('Test message');
  });

  it('should format with date format type', () => {
    const formatter = new TimestampFormatter();
    const event = new LogEvent('info', ['Test message'], 'testLogger', new LogContext({
      formatType: 'date'
    }));
    event.timestamp = TEST_TIMESTAMP;

    const formattedOutput = formatter.format(event);

    const expectedTimestamp = new Date(TEST_TIMESTAMP).toLocaleDateString(
      'zh-CN',
      {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'UTC'
      }
    );

    expect(formattedOutput[0]).toBe(`[${expectedTimestamp} info]`);
  });

  it('should format with time format type', () => {
    const formatter = new TimestampFormatter();
    const event = new LogEvent('info', ['Test message'], 'testLogger', new LogContext({
      formatType: 'time'
    }));
    event.timestamp = TEST_TIMESTAMP;

    const formattedOutput = formatter.format(event);

    const expectedTimestamp = new Date(TEST_TIMESTAMP).toLocaleTimeString(
      'zh-CN',
      {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'UTC'
      }
    );

    expect(formattedOutput[0]).toBe(`[${expectedTimestamp} info]`);
  });

  it('should use custom locale', () => {
    const formatter = new TimestampFormatter({ locale: 'en-US' });
    const event = new LogEvent('info', ['Test message'], 'testLogger');
    event.timestamp = TEST_TIMESTAMP;

    const formattedOutput = formatter.format(event);

    const expectedTimestamp = new Date(TEST_TIMESTAMP).toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    });

    expect(formattedOutput[0]).toBe(`[${expectedTimestamp} info]`);
  });

  it('should use custom date time options', () => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'UTC'
    };

    const formatter = new TimestampFormatter({
      locale: 'en-US',
      localeOptions: options
    });
    const event = new LogEvent('warn', ['Test message'], 'testLogger');
    event.timestamp = TEST_TIMESTAMP;

    const formattedOutput = formatter.format(event);

    const expectedTimestamp = new Date(TEST_TIMESTAMP).toLocaleString(
      'en-US',
      options
    );

    expect(formattedOutput[0]).toBe(`[${expectedTimestamp} warn]`);
  });

  it('should handle all format types with different locales', () => {
    const formatTypes: DateFormatType[] = ['date', 'time', 'datetime'];
    const locales = ['zh-CN', 'en-US', 'ja-JP'];

    for (const formatType of formatTypes) {
      for (const locale of locales) {
        const formatter = new TimestampFormatter({ locale });
        const event = new LogEvent('info', ['Test'], 'logger', new LogContext({ formatType }));
        event.timestamp = TEST_TIMESTAMP;

        const formattedOutput = formatter.format(event);

        let dateMethod;
        switch (formatType) {
          case 'date':
            dateMethod = 'toLocaleDateString';
            break;
          case 'time':
            dateMethod = 'toLocaleTimeString';
            break;
          case 'datetime':
            dateMethod = 'toLocaleString';
            break;
        }

        // @ts-expect-error
        const expectedTimestamp = new Date(TEST_TIMESTAMP)[dateMethod](locale, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'UTC'
        });

        expect(formattedOutput[0]).toBe(`[${expectedTimestamp} info]`);
      }
    }
  });
});
