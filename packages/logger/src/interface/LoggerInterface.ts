import { HandlerInterface } from './HandlerInterface';
import { LogContext } from './LogContext';


export interface LoggerInterface {
  log(...args: unknown[]): void;
  fatal(...args: unknown[]): void;
  error(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  info(...args: unknown[]): void;
  debug(...args: unknown[]): void;
  trace(...args: unknown[]): void;

  addAppender(appender: HandlerInterface): void;
  /**
   * Creates a new LogContext instance
   *
   * @since 0.1.0
   * @param value - Optional value to be stored in the context
   * @returns A new LogContext instance with the provided value
   */
  context<Value>(value?: Value): LogContext<Value>;
}
