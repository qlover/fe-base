import { LoggerInterface } from './interface/LoggerInterface';
import { HandlerInterface } from './interface/HandlerInterface';
import { LogEvent } from './interface/LogEvent';
import { LogContext } from './interface/LogContext';

/**
 * Default log levels with their priorities (lower number = higher priority)
 *
 * This defines the standard hierarchy of logging levels:
 * - fatal (0): System is unusable, application crashes
 * - error (1): Error events that might still allow the application to continue running
 * - warn (2): Potentially harmful situations that don't cause application failure
 * - info (3): Informational messages highlighting application progress
 * - debug (4): Detailed information useful for debugging
 * - trace (5): Most granular information for very detailed diagnostics
 * - log (6): General purpose logging (alias for info)
 *
 * @type {Object.<string, number>}
 */
export const defaultLevels = {
  fatal: 0,
  error: 10,
  warn: 20,
  info: 30,
  debug: 40,
  trace: 50,
  log: 60
};

/**
 * Configuration options for the Logger
 */
export type LoggerOptions = {
  /**
   * Silent mode - when true, no logs will be output regardless of level
   * Useful for completely disabling logging in production or test environments
   * without changing the code.
   *
   * @default false
   */
  silent?: boolean;

  /**
   * Custom log levels with numeric priority values
   * Lower numbers indicate higher priority levels (0 is highest priority)
   *
   * You can define your own custom levels or override the default ones.
   *
   * @important When defining custom levels, ensure consistency across your application
   * @default defaultLevels
   * @example
   * {
   *   critical: 0,
   *   serious: 1,
   *   important: 2,
   *   normal: 3,
   *   verbose: 4
   * }
   */
  levels?: Record<string, number>;

  /**
   * Current log level threshold
   * Only logs with a level priority <= this level's priority will be processed
   *
   * @important Setting level to "info" means info, warn, error, and fatal logs will be output,
   * while debug and trace will be filtered out
   * @example "info" - Will output info, warn, error, and fatal logs
   * @example "debug" - Will output all logs except trace
   */
  level?: string;

  /**
   * Logger instance identifier
   * Used to identify the source of log messages, especially useful when using multiple loggers
   *
   * @default Date.now().toString()
   * @example "api-server", "payment-process", "user-service"
   */
  name?: string;

  /**
   * Log handlers that process and output the log events
   * Can be a single handler or an array of handlers
   *
   * Handlers determine how and where logs are output (console, file, network, etc.)
   *
   * @example [new ConsoleHandler(), new FileAppender('./logs/app.log')]
   */
  handlers?: HandlerInterface | HandlerInterface[];
};

/**
 * Main Logger class that implements the LoggerInterface
 * Processes log events and distributes them to registered handlers
 *
 * This class follows a flexible logging architecture where:
 * 1. Log events are created based on severity level
 * 2. Events are filtered according to configured level thresholds
 * 3. Approved events are passed to handlers for formatting and output
 *
 * @implements {LoggerInterface}
 * @example
 * // Basic usage
 * const logger = new Logger({ level: 'info' });
 * logger.addAppender(new ConsoleHandler());
 * logger.info('Application started');
 *
 * @example
 * // Advanced usage with context
 * logger.error('Payment failed', {
 *   userId: 123,
 *   amount: 50.25,
 *   currency: 'USD',
 *   error: new Error('Insufficient funds')
 * });
 */
export class Logger implements LoggerInterface {
  /**
   * Creates a new Logger instance
   *
   * @param options - Configuration options for the logger
   *
   * @note If no name is provided, a timestamp-based name will be generated
   * @note If no levels are provided, defaultLevels will be used
   * @note If no handlers are provided, an empty array will be used (silent logging)
   */
  constructor(protected options: LoggerOptions = {}) {
    options.name = options.name || Date.now().toString();
    options.levels = options.levels || defaultLevels;

    options.handlers = Array.isArray(options.handlers)
      ? options.handlers
      : options.handlers
        ? [options.handlers]
        : [];
  }

  /**
   * Adds a new log handler to the logger
   *
   * Handlers are responsible for actually outputting log messages (to console, files, etc.)
   * Multiple handlers can be registered to send logs to different destinations simultaneously.
   *
   * @override Implementation of LoggerInterface
   * @param appender - Handler instance to add
   *
   * @example
   * logger.addAppender(new ConsoleHandler());
   * logger.addAppender(new FileAppender('./logs/errors.log', { level: 'error' }));
   *
   * @note Handlers are processed in the order they are added
   * @important This method is named 'addAppender' for legacy/compatibility reasons,
   * but it works with any object implementing HandlerInterface
   */
  addAppender(appender: HandlerInterface): void {
    (this.options.handlers as HandlerInterface[]).push(appender);
  }

  /**
   * Creates a new LogContext instance
   *
   * @override
   * @since 0.1.0
   * @param value - Optional value to be stored in the context
   * @returns A new LogContext instance with the provided value
   */
  context<Value>(value?: Value): LogContext<Value> {
    return new LogContext(value);
  }

  /**
   * Internal method to process and distribute log events
   *
   * This method:
   * 1. Checks if logging is silenced
   * 2. Extracts context from arguments if present
   * 3. Applies level filtering based on configured threshold
   * 4. Creates a LogEvent and distributes it to all handlers
   *
   * @protected
   * @param level - Log level name (e.g., "info", "error")
   * @param args - Log message arguments (message content and optional context)
   *
   * @example context
   * ```ts
   * logger.info('message with context', logger.context({ user: 'testUser', requestId: '123' }));
   * logger.info('message with context', logger.context([1,2,3]));
   * logger.info('message with context', logger.context(1));
   * logger.info('message with context', logger.context('1'));
   * logger.info('message with context', logger.context(true));
   * logger.info('message with context', logger.context());
   * ```
   *
   * **But context only support last argument and must be a non-null object**
   *
   * @note Context object must be the last argument and must be a non-null object
   * @note Context can override the log level via a 'level' property
   * @important This method is not meant to be called directly - use the specific level methods instead
   */
  protected print(level: string, args: unknown[]): void {
    const { levels, level: indexLevel, silent, handlers } = this.options;

    // Skip logging if in silent mode
    if (silent) {
      return;
    }

    // Extract context object from arguments if present
    let ctx = args.slice(-1)[0] as LogContext<unknown> | undefined;
    const hasCtx = args.length > 1 && ctx instanceof LogContext;
    ctx = hasCtx ? ctx : undefined;
    args = hasCtx ? args.slice(0, -1) : args;

    // Allow level override from context, if a plain object is provided
    level = (ctx?.value as { level?: string })?.level ?? level;

    // Apply level filtering based on configured threshold
    if (indexLevel && levels) {
      const target = levels[indexLevel!];
      const current = levels[level];
      if (target != null && current != null && current > target) {
        return;
      }
    }

    // Create and distribute log event to all handlers
    const logEvent = new LogEvent(level, args, this.options.name!, ctx);

    for (const handler of handlers as HandlerInterface[]) {
      handler.append(logEvent);
    }
  }

  /**
   * Logs a message with "info" level
   * Alias for info() method
   *
   * General purpose logging method, categorized as "info" level
   *
   * @param args - Message content followed by optional context object
   *
   * @example
   * // Simple usage
   * logger.log('User logged in');
   *
   * @example
   * // With context object
   * logger.log('User logged in', { userId: 123, timestamp: Date.now() });
   *
   * @note This method uses 'info' level internally, but appears as 'log' in default levels
   */
  log(...args: unknown[]): void {
    this.print('info', args);
  }

  /**
   * Logs a critical error message with "fatal" level
   *
   * Use for severe errors that lead to application termination or require immediate attention
   * This is the highest severity level and will always be logged unless silent mode is enabled
   *
   * @param args - Message content followed by optional context object
   *
   * @example
   * logger.fatal('Database connection failed, application cannot continue');
   *
   * @example
   * try {
   *   // Critical operation
   * } catch (error) {
   *   logger.fatal('Critical system failure', { error, stack: error.stack });
   *   process.exit(1);
   * }
   *
   * @important Fatal logs typically indicate that the application cannot continue to function
   */
  fatal(...args: unknown[]): void {
    this.print('fatal', args);
  }

  /**
   * Logs an error message with "error" level
   *
   * Use for runtime errors, exceptions, and error conditions that don't necessarily
   * cause application termination but indicate a failure
   *
   * @param args - Message content followed by optional context object
   *
   * @example
   * // Simple error logging
   * logger.error('Failed to process payment');
   *
   * @example
   * // Error with exception details
   * try {
   *   // Some operation
   * } catch (err) {
   *   logger.error('Operation failed', {
   *     error: err.message,
   *     stack: err.stack,
   *     code: err.code
   *   });
   * }
   *
   * @note Error logs should provide enough context to diagnose the problem
   */
  error(...args: unknown[]): void {
    this.print('error', args);
  }

  /**
   * Logs a warning message with "warn" level
   *
   * Use for potentially problematic situations, deprecated features usage,
   * or unexpected conditions that don't cause failures but might lead to issues
   *
   * @param args - Message content followed by optional context object
   *
   * @example
   * // Simple warning
   * logger.warn('Deprecated API being used');
   *
   * @example
   * // Warning with context
   * logger.warn('High memory usage detected', {
   *   memoryUsage: process.memoryUsage().heapUsed,
   *   threshold: maxMemoryThreshold
   * });
   *
   * @note Warnings shouldn't be ignored in production systems as they often indicate future problems
   */
  warn(...args: unknown[]): void {
    this.print('warn', args);
  }

  /**
   * Logs an informational message with "info" level
   *
   * Use for general application state, notable events in application flow,
   * startup messages, configuration details, or business process completions
   *
   * @param args - Message content followed by optional context object
   *
   * @example
   * // Simple info message
   * logger.info('Server started on port 3000');
   *
   * @example
   * // Info with context
   * logger.info('User registration complete', {
   *   userId: user.id,
   *   email: user.email,
   *   registrationTime: new Date().toISOString()
   * });
   *
   * @note Info level is typically the default level in production environments
   */
  info(...args: unknown[]): void {
    this.print('info', args);
  }

  /**
   * Logs a debug message with "debug" level
   *
   * Use for detailed information useful during development and troubleshooting
   * Such as variable values, function calls, or internal application state
   *
   * @param args - Message content followed by optional context object
   *
   * @example
   * // Simple debug message
   * logger.debug('Processing request payload');
   *
   * @example
   * // Debug with detailed context
   * logger.debug('API request received', {
   *   method: req.method,
   *   path: req.path,
   *   params: req.params,
   *   query: req.query,
   *   headers: req.headers,
   *   body: req.body
   * });
   *
   * @note Debug logs are typically disabled in production environments
   * @important Debug logs can contain sensitive information, use caution in production
   */
  debug(...args: unknown[]): void {
    this.print('debug', args);
  }

  /**
   * Logs a trace message with "trace" level
   *
   * Use for the most detailed diagnostic information
   * Such as function entry/exit points, variable transformations, or method call tracing
   *
   * @param args - Message content followed by optional context object
   *
   * @example
   * // Function entry tracing
   * logger.trace('Entering validateUser function', { username });
   *
   * @example
   * // Detailed algorithmic tracing
   * logger.trace('Processing array element', {
   *   index: i,
   *   value: array[i],
   *   transformedValue: processedValue,
   *   processingTime: endTime - startTime
   * });
   *
   * @note Trace is the most verbose level and should only be enabled temporarily for debugging
   * @important Trace logs can significantly impact performance and generate large volumes of data
   */
  trace(...args: unknown[]): void {
    this.print('trace', args);
  }
}
