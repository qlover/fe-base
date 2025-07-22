import { type FormatterInterface, type LogEvent } from '@qlover/logger';
import chalk from 'chalk';

/**
 * Color formatter for log output with customizable level-based coloring
 *
 * Core concept:
 * Provides visual distinction between different log levels by applying
 * chalk color functions to log level text, making log output more readable
 * and easier to scan for different types of messages.
 *
 * Main features:
 * - Level-based coloring: Each log level (fatal, error, warn, info, debug, trace, log)
 *   has a distinct color scheme for quick visual identification
 *   - Fatal: Red background with white bold text (highest visibility)
 *   - Error: Red bold text (critical issues)
 *   - Warn: Yellow bold text (warnings and potential issues)
 *   - Info: Blue text (general information)
 *   - Debug: Green text (debugging information)
 *   - Trace: Gray text (detailed tracing)
 *   - Log: White text (default logging)
 *
 * - Customizable colors: Supports custom color mapping through constructor
 *   - Override default colors for specific levels
 *   - Support both string colors and chalk function references
 *   - Fallback to white color for unknown levels
 *
 * - Chalk integration: Leverages chalk library for cross-platform color support
 *   - Consistent colors across different terminals and operating systems
 *   - Support for various color formats and styles
 *   - Automatic color detection and fallback for non-color terminals
 *
 * @example Basic usage
 * ```typescript
 * const formatter = new ColorFormatter();
 * const formatted = formatter.format({
 *   level: 'error',
 *   args: ['Database connection failed']
 * });
 * // Returns: [chalk.red.bold('ERROR'), 'Database connection failed']
 * ```
 *
 * @example Custom colors
 * ```typescript
 * const customFormatter = new ColorFormatter({
 *   error: chalk.magenta.bold,
 *   info: chalk.cyan,
 *   custom: chalk.rainbow
 * });
 * ```
 */
export class ColorFormatter implements FormatterInterface {
  /**
   * Create a new color formatter with optional custom level colors
   *
   * @param levelColors - Custom color mapping for log levels
   *   - Keys: Log level names (fatal, error, warn, info, debug, trace, log)
   *   - Values: Chalk color functions or string color names
   *   - Unknown levels fallback to white color
   *   - Supports both function references and string values
   *
   * @example Default colors
   * ```typescript
   * const formatter = new ColorFormatter();
   * ```
   *
   * @example Custom colors
   * ```typescript
   * const formatter = new ColorFormatter({
   *   error: chalk.red.underline,
   *   warn: chalk.orange.bold,
   *   info: chalk.blue.italic
   * });
   * ```
   */
  constructor(
    /**
     * Custom color mapping for different log levels
     *
     * Overrides default color scheme for specific log levels.
     * Each level can be mapped to a chalk color function or string.
     * Unknown levels will use white color as fallback.
     *
     * @default `{
     *   fatal: chalk.bgRed.white.bold,
     *   error: chalk.red.bold,
     *   warn: chalk.yellow.bold,
     *   info: chalk.blue,
     *   debug: chalk.green,
     *   trace: chalk.gray,
     *   log: chalk.white
     * }`
     */
    protected levelColors: Record<
      string,
      string | ((...args: unknown[]) => string)
    > = {
      fatal: chalk.bgRed.white.bold,
      error: chalk.red.bold,
      warn: chalk.yellow.bold,
      info: chalk.blue,
      debug: chalk.green,
      trace: chalk.gray,
      log: chalk.white
    }
  ) {}

  /**
   * Format log event by applying color to the level and preserving original arguments
   *
   * Processing steps:
   * 1. Extract level and arguments from the log event
   * 2. Look up the appropriate color function for the log level
   * 3. Apply color function to uppercase level text
   * 4. Return colored level followed by original arguments
   *
   * Color application:
   * - Uses chalk color functions for consistent cross-platform support
   * - Converts level to uppercase for better visibility
   * - Preserves all original log arguments unchanged
   * - Handles both function and string color values
   *
   * @param event - Log event containing level and arguments
   * @returns Array with colored level text followed by original arguments
   *
   * @example Error level formatting
   * ```typescript
   * const result = formatter.format({
   *   level: 'error',
   *   args: ['Connection failed', { retryCount: 3 }]
   * });
   * // Returns: [chalk.red.bold('ERROR'), 'Connection failed', { retryCount: 3 }]
   * ```
   *
   * @example Unknown level fallback
   * ```typescript
   * const result = formatter.format({
   *   level: 'unknown',
   *   args: ['Custom message']
   * });
   * // Returns: [chalk.white('UNKNOWN'), 'Custom message']
   * ```
   */
  format(event: LogEvent): unknown[] {
    const { level, args } = event;

    // Apply the appropriate color function to the level
    const colorFunction =
      this.levelColors[level as keyof typeof this.levelColors] || chalk.white;

    const coloredLevel =
      typeof colorFunction === 'function'
        ? colorFunction(level.toUpperCase())
        : level.toUpperCase();

    // Return the colored level followed by the original arguments
    return [coloredLevel, ...args];
  }
}
