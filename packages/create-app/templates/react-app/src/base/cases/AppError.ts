import { ExecutorError } from '@qlover/fe-corekit';

export class AppError extends ExecutorError {
  constructor(
    public readonly id: string,
    public readonly source?: string | Error
  ) {
    super(id, source);
  }
}
