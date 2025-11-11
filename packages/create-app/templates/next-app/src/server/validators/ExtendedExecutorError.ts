import type { ValidationFaildResult } from '../port/ValidatorInterface';
import type { ExecutorError } from '@qlover/fe-corekit';

export interface ExtendedExecutorError extends ExecutorError {
  issues?: ValidationFaildResult[];
}
