/**
 * Type-safe container for log event context data
 *
 * This class provides a generic wrapper for additional context data
 * that can be attached to log events. It ensures type safety through
 * its generic type parameter and provides a consistent structure for
 * context handling.
 *
 * Core features:
 * - Generic type support
 * - Optional value handling
 * - Immutable context data
 * - Type-safe access
 *
 * @typeParam Value - Type of the context value
 *
 * @example Basic usage
 * ```typescript
 * // Simple context
 * const context = new LogContext({ userId: 123 });
 * logger.info('User action', context);
 * ```
 *
 * @example Type-safe context
 * ```typescript
 * interface RequestContext {
 *   requestId: string;
 *   path: string;
 *   method: string;
 *   userId?: string;
 * }
 *
 * const context = new LogContext<RequestContext>({
 *   requestId: 'req-123',
 *   path: '/api/users',
 *   method: 'GET'
 * });
 *
 * logger.info('Request received', context);
 * ```
 *
 * @example Optional context
 * ```typescript
 * // Empty context
 * const emptyContext = new LogContext();
 *
 * // Context with undefined value
 * const context = new LogContext<string | undefined>(undefined);
 *
 * // Context with null value
 * const nullContext = new LogContext<string | null>(null);
 * ```
 *
 * @example Complex context
 * ```typescript
 * interface PerformanceContext {
 *   operation: string;
 *   metrics: {
 *     duration: number;
 *     memory: {
 *       before: number;
 *       after: number;
 *     };
 *     cpu: {
 *       user: number;
 *       system: number;
 *     };
 *   };
 *   metadata: Record<string, unknown>;
 * }
 *
 * const context = new LogContext<PerformanceContext>({
 *   operation: 'data-processing',
 *   metrics: {
 *     duration: 1500,
 *     memory: {
 *       before: 100000,
 *       after: 150000
 *     },
 *     cpu: {
 *       user: 80,
 *       system: 20
 *     }
 *   },
 *   metadata: {
 *     batchSize: 1000,
 *     compression: true,
 *     priority: 'high'
 *   }
 * });
 *
 * logger.debug('Operation metrics', context);
 * ```
 *
 * @example Context in formatters
 * ```typescript
 * class DetailedFormatter implements FormatterInterface<RequestContext> {
 *   format(event: LogEvent<RequestContext>): string[] {
 *     const ctx = event.context?.value;
 *     if (ctx) {
 *       return [
 *         `[${ctx.method} ${ctx.path}]`,
 *         `[${ctx.requestId}]`,
 *         ...event.args
 *       ];
 *     }
 *     return event.args;
 *   }
 * }
 * ```
 */
export class LogContext<Value> {
  /**
   * Creates a new LogContext instance
   *
   * @param value - Optional context value of type Value
   *
   * The value parameter is marked as optional to support:
   * - Empty contexts (no value provided)
   * - Explicitly undefined values
   * - Nullable types (Value | null)
   *
   * The value is stored as a public property to allow:
   * - Direct access in formatters and handlers
   * - Type-safe value extraction
   * - Optional chaining support
   *
   * @example Basic construction
   * ```typescript
   * // With value
   * const context = new LogContext({ userId: 123 });
   * console.log(context.value?.userId); // 123
   *
   * // Empty context
   * const empty = new LogContext();
   * console.log(empty.value); // undefined
   * ```
   *
   * @example Type-safe construction
   * ```typescript
   * interface UserContext {
   *   id: number;
   *   name: string;
   *   role?: string;
   * }
   *
   * const context = new LogContext<UserContext>({
   *   id: 123,
   *   name: 'John',
   *   role: 'admin'  // Optional property
   * });
   *
   * // Type-safe access
   * const userId = context.value?.id;  // number | undefined
   * const role = context.value?.role;  // string | undefined
   * ```
   *
   * @example Nullable context
   * ```typescript
   * type NullableContext = {
   *   sessionId: string;
   * } | null;
   *
   * // With value
   * const active = new LogContext<NullableContext>({
   *   sessionId: 'sess-123'
   * });
   *
   * // With null
   * const inactive = new LogContext<NullableContext>(null);
   *
   * // Type-safe null handling
   * console.log(active.value?.sessionId);    // 'sess-123'
   * console.log(inactive.value?.sessionId);  // undefined
   * ```
   *
   * @example Context in logging
   * ```typescript
   * interface RequestContext {
   *   path: string;
   *   method: string;
   *   duration: number;
   * }
   *
   * const context = new LogContext<RequestContext>({
   *   path: '/api/users',
   *   method: 'GET',
   *   duration: 150
   * });
   *
   * // Using context in log messages
   * logger.info('Request completed', context);
   *
   * // Accessing context in formatters
   * class RequestFormatter implements FormatterInterface<RequestContext> {
   *   format(event: LogEvent<RequestContext>): string[] {
   *     const ctx = event.context?.value;
   *     return [
   *       ctx ? `${ctx.method} ${ctx.path} (${ctx.duration}ms)` : 'Unknown',
   *       ...event.args
   *     ];
   *   }
   * }
   * ```
   */
  constructor(
    /**
     * The context value that will be attached to log events
     *
     * This value is typed according to the Value type parameter
     * and can be accessed safely through optional chaining.
     */
    public value?: Value
  ) {}
}
