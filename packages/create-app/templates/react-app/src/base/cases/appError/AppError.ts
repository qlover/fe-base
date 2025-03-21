import { ExecutorError } from '@qlover/fe-corekit';

/**
 * 统一当前项目中开发的错误
 */
export class AppError extends ExecutorError {
  constructor(
    public readonly id: string,
    public readonly source?: string | Error
  ) {
    super(id, source);
  }
}
