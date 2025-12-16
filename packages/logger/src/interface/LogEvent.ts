/**
 * Represents a log event in the logging system
 *
 * This class encapsulates all information about a single log event,
 * including the log level, message arguments, timestamp, logger name,
 * and optional typed context data.
 *
 * Core features:
 * - Automatic timestamp generation
 * - Type-safe context support
 * - Flexible argument handling
 * - Logger identification
 *
 * @typeParam Ctx - Type of the context value, defaults to unknown
 *
 * @example Basic usage
 * ```typescript
 * const event = new LogEvent(
 *   'info',
 *   ['Application started'],
 *   'app'
 * );
 * // event.timestamp is automatically set
 * console.log(event);
 * ```
 *
 * @example With context
 * ```typescript
 * interface RequestContext {
 *   requestId: string;
 *   userId: string;
 *   path: string;
 * }
 *
 * const event = new LogEvent<RequestContext>(
 *   'info',
 *   ['Request processed', { duration: 150 }],
 *   'http',
 *   new LogContext({
 *     requestId: 'req-123',
 *     userId: 'user-456',
 *     path: '/api/users'
 *   })
 * );
 * ```
 *
 * @example Error event
 * ```typescript
 * const error = new Error('Database connection failed');
 * const event = new LogEvent(
 *   'error',
 *   [
 *     'Failed to connect to database',
 *     {
 *       error: error.message,
 *       stack: error.stack,
 *       code: 'DB_CONN_ERROR'
 *     }
 *   ],
 *   'database'
 * );
 * ```
 *
 * @example Performance monitoring
 * ```typescript
 * interface PerformanceContext {
 *   operation: string;
 *   startTime: number;
 *   endTime: number;
 *   metadata: Record<string, unknown>;
 * }
 *
 * const event = new LogEvent<PerformanceContext>(
 *   'debug',
 *   ['Operation completed'],
 *   'performance',
 *   new LogContext({
 *     operation: 'data-processing',
 *     startTime: 1679395845000,
 *     endTime: 1679395846000,
 *     metadata: {
 *       itemsProcessed: 1000,
 *       batchSize: 100,
 *       cacheHits: 850
 *     }
 *   })
 * );
 * ```
 */
export class LogEvent<Ctx = unknown> {
  /**
   * Timestamp when the log event was created
   *
   * Automatically set to the current time in milliseconds since the Unix epoch
   * when the event is constructed. This ensures accurate timing information
   * for each log entry.
   *
   * @example
   * ```typescript
   * const event = new LogEvent('info', ['message'], 'app');
   * console.log(new Date(event.timestamp).toISOString());
   * // Output: "2024-03-21T14:30:45.123Z"
   * ```
   */
  public timestamp: number;

  constructor(
    /**
     * Log level indicating the severity or importance
     *
     * Common values:
     * - 'fatal': System is unusable
     * - 'error': Error conditions
     * - 'warn': Warning conditions
     * - 'info': Informational messages
     * - 'debug': Debug-level messages
     * - 'trace': Trace-level messages
     *
     * @example
     * ```typescript
     * new LogEvent('error', ['Database connection failed'], 'db');
     * ```
     */
    public level: string,

    /**
     * Array of log message arguments
     *
     * The first argument is typically the main message string,
     * followed by optional data objects, error instances, or
     * other relevant information.
     *
     * @example
     * ```typescript
     * // Simple message
     * new LogEvent('info', ['User logged in'], 'auth');
     *
     * // Message with data
     * new LogEvent('info', [
     *   'User logged in',
     *   { userId: 123, role: 'admin' }
     * ], 'auth');
     *
     * // Error with details
     * new LogEvent('error', [
     *   'Operation failed',
     *   new Error('Invalid input'),
     *   { operation: 'validate', input: data }
     * ], 'validator');
     * ```
     */
    public args: unknown[],

    /**
     * Name of the logger that created this event
     *
     * Used to identify the source or category of the log event.
     * This can be a module name, service name, or any other
     * identifier that helps categorize log events.
     *
     * @example
     * ```typescript
     * // Module-based names
     * new LogEvent('info', ['Starting'], 'auth.service');
     * new LogEvent('debug', ['Cache miss'], 'data.cache');
     *
     * // Component-based names
     * new LogEvent('info', ['Render complete'], 'ui.dashboard');
     * new LogEvent('error', ['API error'], 'api.users');
     * ```
     */
    public loggerName: string,

    /**
     * Optional typed context data for the log event
     *
     * Provides additional structured data that can be used by
     * formatters and handlers. The context type is controlled
     * by the Ctx type parameter.
     *
     * @example
     * ```typescript
     * // Request context
     * interface RequestContext {
     *   requestId: string;
     *   path: string;
     *   method: string;
     * }
     *
     * new LogEvent<RequestContext>(
     *   'info',
     *   ['Request received'],
     *   'http',
     *   new LogContext({
     *     requestId: 'req-123',
     *     path: '/api/users',
     *     method: 'GET'
     *   })
     * );
     *
     * // Performance context
     * interface PerfContext {
     *   duration: number;
     *   memoryUsage: number;
     * }
     *
     * new LogEvent<PerfContext>(
     *   'debug',
     *   ['Operation completed'],
     *   'perf',
     *   new LogContext({
     *     duration: 150,
     *     memoryUsage: process.memoryUsage().heapUsed
     *   })
     * );
     * ```
     */
    public context?: Ctx
  ) {
    /**
     * Initialize the timestamp to the current time
     *
     * This ensures that each log event has an accurate timestamp
     * that reflects when it was actually created, not when it was
     * processed or output.
     *
     * The timestamp is stored as milliseconds since the Unix epoch,
     * which provides:
     * - Consistent format across platforms
     * - Easy conversion to other formats
     * - Precise timing information
     * - Timezone independence
     *
     * @example Converting to different formats
     * ```typescript
     * const event = new LogEvent('info', ['message'], 'app');
     *
     * // ISO string
     * new Date(event.timestamp).toISOString();
     * // "2024-03-21T14:30:45.123Z"
     *
     * // Local time string
     * new Date(event.timestamp).toLocaleString();
     * // "3/21/2024, 2:30:45 PM"
     *
     * // Custom format
     * const formatter = new Intl.DateTimeFormat('en-US', {
     *   year: 'numeric',
     *   month: '2-digit',
     *   day: '2-digit',
     *   hour: '2-digit',
     *   minute: '2-digit',
     *   second: '2-digit',
     *   fractionalSecondDigits: 3,
     *   hour12: false
     * });
     * formatter.format(new Date(event.timestamp));
     * // "03/21/2024, 14:30:45.123"
     * ```
     */
    this.timestamp = Date.now();
  }
}
