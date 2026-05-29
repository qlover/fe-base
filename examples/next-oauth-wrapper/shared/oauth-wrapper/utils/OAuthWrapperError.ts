import { ExecutorError } from '@qlover/fe-corekit';
import type { OAuthRfcCodeType } from '../config';

export class OAuthWrapperError extends ExecutorError {
  public readonly name = 'OAuthWrapperError';

  constructor(
    id: OAuthRfcCodeType,
    public readonly status: number,
    cause?: unknown
  ) {
    super(id, cause);
  }
}
