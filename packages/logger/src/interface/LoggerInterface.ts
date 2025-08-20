import { HandlerInterface } from './HandlerInterface';
import { LogContext } from './LogContext';

/**
 * Core interface for logger implementations
 *
 * This interface defines the standard contract for logger implementations,
 * providing methods for different log levels, handler management, and
 * context creation.
 *
 * Core functionality:
 * - Standard log level methods (fatal, error, warn, info, debug, trace)
 * - Handler (appender) management
 * - Context creation for structured logging
 * - Type-safe logging with generic context support
 *
 * @example Basic usage
 * ```typescript
 * class MyLogger implements LoggerInterface {
 *   info(...args: unknown[]): void {
 *     console.log('[INFO]', ...args);
 *   }
 *   // ... implement other methods
 * }
 *
 * const logger = new MyLogger();
 * logger.info('Application started');
 * ```
 *
 * @example With handlers and context
 * ```typescript
 * class AdvancedLogger implements LoggerInterface {
 *   private handlers: HandlerInterface[] = [];
 *
 *   addAppender(handler: HandlerInterface): void {
 *     this.handlers.push(handler);
 *   }
 *
 *   info(...args: unknown[]): void {
 *     const event = {
 *       level: 'info',
 *       args,
 *       timestamp: Date.now()
 *     };
 *
 *     this.handlers.forEach(handler => handler.append(event));
 *   }
 *
 *   context<T>(value?: T): LogContext<T> {
 *     return new LogContext(value);
 *   }
 *   // ... implement other methods
 * }
 *
 * const logger = new AdvancedLogger();
 * logger.addAppender(new ConsoleHandler());
 * logger.info('User logged in', logger.context({ userId: 123 }));
 * ```
 *
 * @example Type-safe context usage
 * ```typescript
 * interface UserContext {
 *   userId: number;
 *   username: string;
 *   role: string;
 * }
 *
 * const logger: LoggerInterface = new Logger();
 *
 * // Type-safe context
 * logger.info('User action', logger.context<UserContext>({
 *   userId: 123,
 *   username: 'john_doe',
 *   role: 'admin'
 * }));
 * ```
 */
export interface LoggerInterface {
  /**
   * General purpose logging method (alias for info)
   *
   * @param args - Message content followed by optional context
   *
   * @example
   * ```typescript
   * logger.log('Application started');
   * logger.log('User action', { userId: 123 });
   * logger.log('Process completed', logger.context({ duration: 1500 }));
   * ```
   */
  log(...args: unknown[]): void;

  /**
   * Logs a critical error that causes application termination
   *
   * Use for severe errors that:
   * - Cause immediate application shutdown
   * - Require immediate administrator attention
   * - Indicate system is unusable
   *
   * @param args - Message content followed by optional context
   *
   * @example
   * ```typescript
   * logger.fatal('Database connection permanently lost');
   * logger.fatal('Out of memory', { memoryUsage: process.memoryUsage() });
   * logger.fatal('System crash', logger.context({
   *   error: new Error('Unrecoverable error'),
   *   state: 'corrupted'
   * }));
   * ```
   */
  fatal(...args: unknown[]): void;

  /**
   * Logs an error condition that doesn't cause termination
   *
   * Use for errors that:
   * - Prevent normal operation but allow recovery
   * - Require administrator attention
   * - Need to be tracked for troubleshooting
   *
   * @param args - Message content followed by optional context
   *
   * @example
   * ```typescript
   * logger.error('Failed to process payment');
   * logger.error('API request failed', { status: 500, path: '/api/users' });
   * logger.error('Database query error', logger.context({
   *   query: 'SELECT * FROM users',
   *   error: new Error('Connection timeout')
   * }));
   * ```
   */
  error(...args: unknown[]): void;

  /**
   * Logs a warning condition that might cause issues
   *
   * Use for situations that:
   * - Are unusual but not errors
   * - Might cause problems in the future
   * - Indicate deprecated feature usage
   *
   * @param args - Message content followed by optional context
   *
   * @example
   * ```typescript
   * logger.warn('High memory usage detected');
   * logger.warn('Deprecated API used', { api: 'oldMethod', alternative: 'newMethod' });
   * logger.warn('Cache miss rate high', logger.context({
   *   rate: '85%',
   *   threshold: '75%'
   * }));
   * ```
   */
  warn(...args: unknown[]): void;

  /**
   * Logs normal but significant events
   *
   * Use for events that:
   * - Mark major application state changes
   * - Track business process completion
   * - Record user actions
   *
   * @param args - Message content followed by optional context
   *
   * @example
   * ```typescript
   * logger.info('Application started on port 3000');
   * logger.info('User logged in', { userId: 123, role: 'admin' });
   * logger.info('Order processed', logger.context({
   *   orderId: 'ORD-123',
   *   amount: 99.99,
   *   currency: 'USD'
   * }));
   * ```
   */
  info(...args: unknown[]): void;

  /**
   * Logs detailed information for debugging
   *
   * Use for information that:
   * - Helps diagnose problems
   * - Shows detailed flow of execution
   * - Exposes internal state
   *
   * @param args - Message content followed by optional context
   *
   * @example
   * ```typescript
   * logger.debug('Processing request payload');
   * logger.debug('Cache state', { size: 1024, entries: 50 });
   * logger.debug('Query execution plan', logger.context({
   *   sql: 'SELECT * FROM users WHERE role = ?',
   *   params: ['admin'],
   *   executionTime: 150
   * }));
   * ```
   */
  debug(...args: unknown[]): void;

  /**
   * Logs the most detailed level of information
   *
   * Use for information that:
   * - Shows step-by-step execution flow
   * - Includes method entry/exit points
   * - Contains variable state changes
   *
   * @param args - Message content followed by optional context
   *
   * @example
   * ```typescript
   * logger.trace('Entering method processUser');
   * logger.trace('Variable state', { counter: 5, buffer: [1,2,3] });
   * logger.trace('Method execution', logger.context({
   *   method: 'processUser',
   *   args: { id: 123 },
   *   stack: new Error().stack
   * }));
   * ```
   */
  trace(...args: unknown[]): void;

  /**
   * Adds a new handler (appender) to the logger
   *
   * Handlers are responsible for processing and outputting log events.
   * Multiple handlers can be added to send logs to different destinations
   * or format them differently.
   *
   * @param appender - The handler instance to add
   *
   * @example Basic console handler
   * ```typescript
   * const logger = new Logger();
   * logger.addAppender(new ConsoleHandler());
   * ```
   *
   * @example Multiple handlers
   * ```typescript
   * const logger = new Logger();
   *
   * // Console output for development
   * logger.addAppender(new ConsoleHandler(
   *   new TimestampFormatter({ locale: 'en-US' })
   * ));
   *
   * // File output for errors
   * logger.addAppender(new FileHandler('./logs/errors.log', {
   *   level: 'error',
   *   formatter: new JSONFormatter()
   * }));
   *
   * // Metrics collection
   * logger.addAppender(new MetricsHandler({
   *   service: 'user-api',
   *   endpoint: 'https://metrics.example.com'
   * }));
   * ```
   *
   * @example Conditional handlers
   * ```typescript
   * const logger = new Logger();
   *
   * // Development handlers
   * if (process.env.NODE_ENV === 'development') {
   *   logger.addAppender(new ConsoleHandler(
   *     new PrettyFormatter({ colors: true })
   *   ));
   *   logger.addAppender(new FileHandler('./logs/dev.log'));
   * }
   *
   * // Production handlers
   * if (process.env.NODE_ENV === 'production') {
   *   logger.addAppender(new CloudWatchHandler({
   *     region: 'us-east-1',
   *     logGroupName: '/aws/api'
   *   }));
   *   logger.addAppender(new AlertHandler({
   *     level: 'error',
   *     webhook: 'https://alerts.example.com'
   *   }));
   * }
   * ```
   */
  addAppender(appender: HandlerInterface): void;
  /**
   * Creates a new LogContext instance for structured logging
   *
   * Context objects allow adding structured data to log messages
   * in a type-safe way. They can be used to add metadata,
   * performance metrics, error details, or any other relevant
   * information to log entries.
   *
   * @since 0.1.0
   * @param value - Optional value to be stored in the context
   * @returns A new LogContext instance with the provided value
   *
   * @example Basic context usage
   * ```typescript
   * logger.info('User logged in', logger.context({
   *   userId: 123,
   *   role: 'admin',
   *   loginTime: new Date()
   * }));
   * ```
   *
   * @example Type-safe context
   * ```typescript
   * interface RequestContext {
   *   method: string;
   *   path: string;
   *   duration: number;
   *   statusCode: number;
   * }
   *
   * logger.info('Request completed', logger.context<RequestContext>({
   *   method: 'GET',
   *   path: '/api/users',
   *   duration: 150,
   *   statusCode: 200
   * }));
   * ```
   *
   * @example Error context
   * ```typescript
   * try {
   *   await processOrder(orderId);
   * } catch (error) {
   *   logger.error('Order processing failed', logger.context({
   *     orderId,
   *     error: error instanceof Error ? error.message : String(error),
   *     stack: error instanceof Error ? error.stack : undefined
   *   }));
   * }
   * ```
   *
   * @example Performance monitoring
   * ```typescript
   * const startTime = Date.now();
   * try {
   *   const result = await heavyOperation();
   *   logger.info('Operation completed', logger.context({
   *     duration: Date.now() - startTime,
   *     resultSize: result.length,
   *     memoryUsage: process.memoryUsage()
   *   }));
   * } catch (error) {
   *   logger.error('Operation failed', logger.context({
   *     duration: Date.now() - startTime,
   *     error,
   *     memoryUsage: process.memoryUsage()
   *   }));
   * }
   * ```
   */
  context<Value>(value?: Value): LogContext<Value>;
}
