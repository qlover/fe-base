import type { ExecutorError } from '@qlover/fe-corekit/executor';

export type ValidationResult<T> =
  | ValidationResultSuccess<T>
  | ValidationResultFailed;

export type ValidationResultSuccess<T> = {
  success: true;
  data: T;
  message?: never;
};

export type ValidationResultFailed = {
  success: false;

  /**
   * Failed property path for locating the error source.
   */
  path: PropertyKey[];

  data?: never;

  /**
   * Failure message, usually an i18n identifier.
   */
  message: string;
};

export interface ValidatorInterface<T, Result = Promise<T> | T> {
  /**
   * Validate the data and return validation result.
   *
   * ValidationResultSuccess<T> and void are success.
   */
  validate(
    data: unknown
  ): Promise<void | ValidationResult<T>> | void | ValidationResult<T>;

  /**
   * Get the data if it is valid, otherwise throw with validation details.
   */
  getThrow(data: unknown): Result;
}

export interface ExtendedExecutorError extends ExecutorError {
  issues?: ValidationResult<unknown>[];
}
