import { FormatterInterface } from './FormatterInterface';
import { LogEvent } from './LogEvent';

export interface HandlerInterface {
  append(event: LogEvent): void;
  setFormatter(formatter: FormatterInterface): void;
}
