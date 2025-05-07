import { LogEvent } from './LogEvent';

export interface FormatterInterface<Ctx = unknown> {
  format(event: LogEvent<Ctx>): unknown | unknown[];
}
