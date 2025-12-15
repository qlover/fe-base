/**
 * TimeUnit
 */
export type TimeUnit =
  | 'millisecond'
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'year';
export type ExpiresInType = number | TimeUnit | [TimeUnit, number];

const UNIT_MAP = {
  millisecond: 1,
  second: 1000,
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000
};

/**
 * QuickerTime is a simple time calculation tool class.
 *
 * The core idea is to provide simple interfaces to calculate time differences.
 * The main function is to add and subtract time units, returning a timestamp.
 * The main purpose is to simplify common time calculation tasks.
 *
 * Usage example:
 * ```
 * const timestamp = QuickerTime.add('day', 1); // The timestamp of one day later
 * const pastTimestamp = QuickerTime.subtract('minute', 30); // The timestamp of 30 minutes ago
 * ```
 */
export class QuickerTime {
  /**
   * Add specified time, return the calculated timestamp
   * @param unit - TimeUnit
   * @param value - The time value to add
   * @param timestamp - Optional parameter, the default is the current time
   * @returns The calculated timestamp (milliseconds)
   */
  public add(
    unit: TimeUnit,
    value: number = 1,
    timestamp: number = Date.now()
  ): number {
    if (unit === 'month') {
      const date = new Date(timestamp);
      date.setMonth(date.getMonth() + value);
      return date.getTime();
    } else if (unit === 'year') {
      const date = new Date(timestamp);
      date.setFullYear(date.getFullYear() + value);
      return date.getTime();
    } else {
      const ms = (UNIT_MAP[unit] || 1) * value;
      return timestamp + ms;
    }
  }

  /**
   * Subtract specified time, return the calculated timestamp
   * @param unit - TimeUnit
   * @param value - The time value to subtract
   * @param timestamp - Optional parameter, the default is the current time
   * @returns The calculated timestamp (milliseconds)
   */
  public subtract(unit: TimeUnit, value: number, timestamp?: number): number {
    return this.add(unit, -value, timestamp);
  }
}
