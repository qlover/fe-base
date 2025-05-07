import { HandlerInterface } from './interface/HandlerInterface';
import { FormatterInterface } from './interface/FormatterInterface';
import { LogEvent } from './interface/LogEvent';

export class ConsoleAppender implements HandlerInterface {
  constructor(protected formatter: FormatterInterface | null = null) {}

  /**
   * Set formatter
   *
   * @override
   * @param formatter
   */
  setFormatter(formatter: FormatterInterface): void {
    this.formatter = formatter;
  }

  /**
   * Append log event
   *
   * @override
   * @param event
   */
  append(event: LogEvent): void {
    const { level, args } = event;

    const formattedArgs = this.formatter ? this.formatter.format(event) : args;

    (
      console[level as 'log' | 'error' | 'warn' | 'info' | 'debug' | 'trace'] ||
      console.log
    )(...(Array.isArray(formattedArgs) ? formattedArgs : [formattedArgs]));
  }
}
