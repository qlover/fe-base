import { FormatterInterface } from './FormatterInterface';
import { LogEvent } from './LogEvent';

/**
 * Interface for log event handlers (appenders)
 *
 * Handlers are responsible for processing and outputting log events to
 * various destinations (console, file, network, etc.). They can optionally
 * use formatters to customize the output format.
 *
 * Core responsibilities:
 * - Process log events
 * - Output logs to specific destinations
 * - Support optional formatting
 * - Handle different log levels
 *
 * @example Basic console handler
 * ```typescript
 * class ConsoleHandler implements HandlerInterface {
 *   private formatter: FormatterInterface | null = null;
 *
 *   append(event: LogEvent): void {
 *     const args = this.formatter
 *       ? this.formatter.format(event)
 *       : event.args;
 *
 *     console.log(...args);
 *   }
 *
 *   setFormatter(formatter: FormatterInterface): void {
 *     this.formatter = formatter;
 *   }
 * }
 * ```
 *
 * @example File handler with rotation
 * ```typescript
 * class RotatingFileHandler implements HandlerInterface {
 *   constructor(
 *     private filename: string,
 *     private maxSize: number = 10 * 1024 * 1024
 *   ) {}
 *
 *   append(event: LogEvent): void {
 *     const message = this.formatter
 *       ? this.formatter.format(event)
 *       : event.args.join(' ');
 *
 *     if (this.shouldRotate()) {
 *       this.rotate();
 *     }
 *     fs.appendFileSync(this.filename, message + '\n');
 *   }
 *
 *   setFormatter(formatter: FormatterInterface): void {
 *     this.formatter = formatter;
 *   }
 *
 *   private shouldRotate(): boolean {
 *     return fs.statSync(this.filename).size > this.maxSize;
 *   }
 *
 *   private rotate(): void {
 *     const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
 *     fs.renameSync(
 *       this.filename,
 *       `${this.filename}.${timestamp}.backup`
 *     );
 *   }
 * }
 * ```
 *
 * @example Network handler with buffering
 * ```typescript
 * class NetworkHandler implements HandlerInterface {
 *   private buffer: LogEvent[] = [];
 *   private timer: NodeJS.Timer | null = null;
 *
 *   constructor(
 *     private endpoint: string,
 *     private batchSize: number = 100,
 *     private flushInterval: number = 5000
 *   ) {
 *     this.startTimer();
 *   }
 *
 *   append(event: LogEvent): void {
 *     this.buffer.push(event);
 *     if (this.buffer.length >= this.batchSize) {
 *       this.flush();
 *     }
 *   }
 *
 *   setFormatter(formatter: FormatterInterface): void {
 *     this.formatter = formatter;
 *   }
 *
 *   private async flush(): Promise<void> {
 *     if (this.buffer.length === 0) return;
 *
 *     const events = this.buffer.map(event => ({
 *       level: event.level,
 *       message: this.formatter
 *         ? this.formatter.format(event)
 *         : event.args.join(' '),
 *       timestamp: event.timestamp
 *     }));
 *
 *     try {
 *       await fetch(this.endpoint, {
 *         method: 'POST',
 *         body: JSON.stringify(events)
 *       });
 *       this.buffer = [];
 *     } catch (error) {
 *       console.error('Failed to send logs:', error);
 *     }
 *   }
 *
 *   private startTimer(): void {
 *     this.timer = setInterval(() => this.flush(), this.flushInterval);
 *   }
 * }
 * ```
 */
export interface HandlerInterface {
  /**
   * Processes and outputs a log event
   *
   * This method is called by the logger for each log event that needs
   * to be processed. The handler can format the event using its formatter
   * (if set) and output it to its destination.
   *
   * Implementation considerations:
   * - Handle all log levels appropriately
   * - Apply formatting if a formatter is set
   * - Handle errors gracefully
   * - Consider performance implications
   *
   * @param event - The log event to process and output
   *
   * @example Basic implementation
   * ```typescript
   * append(event: LogEvent): void {
   *   const output = this.formatter
   *     ? this.formatter.format(event)
   *     : event.args;
   *
   *   console.log(...output);
   * }
   * ```
   *
   * @example Advanced implementation with error handling
   * ```typescript
   * append(event: LogEvent): void {
   *   try {
   *     // Format the event
   *     const formatted = this.formatter
   *       ? this.formatter.format(event)
   *       : event.args;
   *
   *     // Add timestamp and level
   *     const output = [
   *       new Date(event.timestamp).toISOString(),
   *       event.level.toUpperCase(),
   *       ...formatted
   *     ];
   *
   *     // Write to file
   *     fs.appendFileSync(this.filename, output.join(' ') + '\n');
   *   } catch (error) {
   *     console.error('Failed to append log:', error);
   *     // Optionally write to fallback location
   *     fs.appendFileSync(
   *       'error.log',
   *       `Failed to write log: ${error.message}\n`
   *     );
   *   }
   * }
   * ```
   *
   * @example Asynchronous implementation
   * ```typescript
   * async append(event: LogEvent): Promise<void> {
   *   // Format the event
   *   const message = this.formatter
   *     ? this.formatter.format(event)
   *     : event.args.join(' ');
   *
   *   // Prepare log entry
   *   const entry = {
   *     timestamp: event.timestamp,
   *     level: event.level,
   *     message,
   *     metadata: event.context?.value
   *   };
   *
   *   try {
   *     // Send to logging service
   *     await fetch('https://logging.example.com/ingest', {
   *       method: 'POST',
   *       headers: { 'Content-Type': 'application/json' },
   *       body: JSON.stringify(entry)
   *     });
   *   } catch (error) {
   *     // Handle failure
   *     console.error('Failed to send log:', error);
   *     // Add to retry queue
   *     this.retryQueue.push(entry);
   *   }
   * }
   * ```
   */
  append(event: LogEvent): void;
  /**
   * Sets or updates the formatter for this handler
   *
   * The formatter is responsible for converting log events into
   * the desired output format. This method allows changing the
   * formatter at runtime.
   *
   * Implementation considerations:
   * - Handle null formatters gracefully
   * - Consider thread safety in async environments
   * - Clean up old formatter resources if necessary
   *
   * @param formatter - The formatter instance to use
   *
   * @example Basic implementation
   * ```typescript
   * setFormatter(formatter: FormatterInterface): void {
   *   this.formatter = formatter;
   * }
   * ```
   *
   * @example Implementation with cleanup
   * ```typescript
   * setFormatter(formatter: FormatterInterface): void {
   *   if (this.formatter && 'dispose' in this.formatter) {
   *     // Clean up old formatter resources
   *     this.formatter.dispose();
   *   }
   *   this.formatter = formatter;
   * }
   * ```
   *
   * @example Thread-safe implementation
   * ```typescript
   * setFormatter(formatter: FormatterInterface): void {
   *   // Ensure atomic formatter update
   *   this.lock.acquire();
   *   try {
   *     const oldFormatter = this.formatter;
   *     this.formatter = formatter;
   *
   *     // Flush any pending logs with old formatter
   *     if (oldFormatter) {
   *       this.flushBuffer(oldFormatter);
   *     }
   *   } finally {
   *     this.lock.release();
   *   }
   * }
   * ```
   */
  setFormatter(formatter: FormatterInterface): void;
}
