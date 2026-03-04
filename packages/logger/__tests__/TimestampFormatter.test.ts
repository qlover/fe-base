import {
  TimestampFormatter,
  type DateFormatType
} from '../src/TimestampFormatter';
import { LogEvent } from '../src/interface/LogEvent';

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

    expect(formattedOutput[0]).toBe(`[testLogger] [${expectedTimestamp} info]`);
    expect(formattedOutput[1]).toBe('Test message');
  });

  it('should format with date format type', () => {
    const formatter = new TimestampFormatter();
    const event = new LogEvent('info', ['Test message'], 'testLogger', {
      formatType: 'date'
    });
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

    expect(formattedOutput[0]).toBe(`[testLogger] [${expectedTimestamp} info]`);
  });

  it('should format with time format type', () => {
    const formatter = new TimestampFormatter();
    const event = new LogEvent('info', ['Test message'], 'testLogger', {
      formatType: 'time'
    });
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

    expect(formattedOutput[0]).toBe(`[testLogger] [${expectedTimestamp} info]`);
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

    expect(formattedOutput[0]).toBe(`[testLogger] [${expectedTimestamp} info]`);
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

    expect(formattedOutput[0]).toBe(`[testLogger] [${expectedTimestamp} warn]`);
  });

  it('should handle all format types with different locales', () => {
    const formatTypes: DateFormatType[] = ['date', 'time', 'datetime'];
    const locales = ['zh-CN', 'en-US', 'ja-JP'];

    for (const formatType of formatTypes) {
      for (const locale of locales) {
        const formatter = new TimestampFormatter({ locale });
        const event = new LogEvent('info', ['Test'], 'logger', { formatType });
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

        expect(formattedOutput[0]).toBe(`[logger] [${expectedTimestamp} info]`);
      }
    }
  });

  it('should skip unknown variables in prefixTemplate (no error)', () => {
    const formatter = new TimestampFormatter({
      prefixTemplate:
        '[{loggerName}] [{formattedTimestamp} {level}] {unknownVar}'
    });
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
    // Unknown {unknownVar} is replaced with empty string, not left as literal
    expect(formattedOutput[0]).toBe(
      `[testLogger] [${expectedTimestamp} info] `
    );
    expect((formattedOutput[0] as string).includes('unknownVar')).toBe(false);
  });

  describe('updateOptions', () => {
    it('should update locale at runtime and use it in subsequent format', () => {
      const formatter = new TimestampFormatter({ locale: 'zh-CN' });
      const event = new LogEvent('info', ['Test'], 'logger');
      event.timestamp = TEST_TIMESTAMP;

      const before = formatter.format(event);
      const expectedZh = new Date(TEST_TIMESTAMP).toLocaleString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'UTC'
      });
      expect(before[0]).toBe(`[logger] [${expectedZh} info]`);

      formatter.updateOptions({ locale: 'en-US' });
      const after = formatter.format(event);
      const expectedEn = new Date(TEST_TIMESTAMP).toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'UTC'
      });
      expect(after[0]).toBe(`[logger] [${expectedEn} info]`);
    });

    it('should update prefixTemplate at runtime', () => {
      const formatter = new TimestampFormatter({
        prefixTemplate: '[{formattedTimestamp}] {level}:'
      });
      const event = new LogEvent('info', ['Msg'], 'logger');
      event.timestamp = TEST_TIMESTAMP;

      const expected = new Date(TEST_TIMESTAMP).toLocaleString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'UTC'
      });
      expect(formatter.format(event)[0]).toBe(`[${expected}] info:`);

      formatter.updateOptions({
        prefixTemplate: '{level} | {formattedTimestamp} -'
      });
      expect(formatter.format(event)[0]).toBe(`info | ${expected} -`);
    });

    it('should update localeOptions at runtime', () => {
      const formatter = new TimestampFormatter({
        locale: 'en-US',
        localeOptions: { hour12: false, timeZone: 'UTC' }
      });
      const event = new LogEvent('info', ['Msg'], 'logger');
      event.timestamp = TEST_TIMESTAMP;

      formatter.updateOptions({
        localeOptions: {
          hour12: true,
          timeZone: 'UTC',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }
      });
      const formattedOutput = formatter.format(event);
      const expectedTimestamp = new Date(TEST_TIMESTAMP).toLocaleString(
        'en-US',
        {
          hour12: true,
          timeZone: 'UTC',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }
      );
      expect(formattedOutput[0]).toBe(`[logger] [${expectedTimestamp} info]`);
    });

    it('should merge partial options and keep unspecified options', () => {
      const formatter = new TimestampFormatter({
        locale: 'zh-CN',
        prefixTemplate: '[{formattedTimestamp}] {level}'
      });
      const event = new LogEvent('info', ['Msg'], 'logger');
      event.timestamp = TEST_TIMESTAMP;

      formatter.updateOptions({ locale: 'en-US' });
      const formattedOutput = formatter.format(event);
      const expectedTimestamp = new Date(TEST_TIMESTAMP).toLocaleString(
        'en-US',
        {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'UTC'
        }
      );
      expect(formattedOutput[0]).toBe(
        `[${expectedTimestamp}] info`
      );
      expect((formattedOutput[0] as string).includes('logger')).toBe(false);
    });

    it('should support multiple updateOptions calls', () => {
      const formatter = new TimestampFormatter({ locale: 'zh-CN' });
      const event = new LogEvent('info', ['Msg'], 'logger');
      event.timestamp = TEST_TIMESTAMP;

      formatter.updateOptions({ locale: 'en-US' });
      formatter.updateOptions({ locale: 'ja-JP' });
      const formattedOutput = formatter.format(event);
      const expectedTimestamp = new Date(TEST_TIMESTAMP).toLocaleString(
        'ja-JP',
        {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'UTC'
        }
      );
      expect(formattedOutput[0]).toContain(expectedTimestamp);
    });
  });
});
