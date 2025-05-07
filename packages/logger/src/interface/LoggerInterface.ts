import { HandlerInterface } from './HandlerInterface';


export interface LoggerInterface {
  log(...args: unknown[]): void;
  fatal(...args: unknown[]): void;
  error(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  info(...args: unknown[]): void;
  debug(...args: unknown[]): void;
  trace(...args: unknown[]): void;

  addAppender(appender: HandlerInterface): void;
}
