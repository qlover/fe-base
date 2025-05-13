import { LogContext } from './LogContext';

export class LogEvent<Ctx = unknown> {
  public timestamp: number;

  constructor(
    public level: string,
    public args: unknown[],
    public loggerName: string,
    public context?: LogContext<Ctx>
  ) {
    this.timestamp = Date.now();
  }
}
