import type { ExecutorError } from '@qlover/fe-corekit';

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
   * 验证失败的属性路径，用于定位错误来源
   *
   * @example
   * ```ts
   * {
   *   path: ['name'],
   *   message: 'Name is required'
   * }
   * ```
   */
  path: PropertyKey[];

  data?: never;

  /**
   * 验证失败的消息
   *
   * 一般是一个 identifier
   *
   * @example
   * ```ts
   * {
   *   path: ['email'],
   *   message: V_LOGIN_EMAIL_REQUIRED
   * }
   * ```
   */
  message: string;
};

export interface ValidatorInterface<T, Result = Promise<T> | T> {
  /**
   * Validate the data and return validation result
   *
   * If return `void | ValidationResult<T>`, the result will be `ValidationResult<T>`;
   * If return `Promise<void | ValidationResult<T>>`, the result will be `Promise<ValidationResult<T>>`;
   *
   * ValidationResultSuccess<T> and void are success
   *
   * @param data - The data to validate
   * @returns true if validation passes, or ValidationError if validation fails
   */
  validate(
    data: unknown
  ): Promise<void | ValidationResult<T>> | void | ValidationResult<T>;

  /**
   * Get the data if it is valid, otherwise throw an error with validation details
   * @param data - The data to validate
   * @returns The data if it is valid
   * @throws {ExtendedExecutorError} if the data is invalid, with validation errors
   */
  getThrow(data: unknown): Result;
}

export interface ExtendedExecutorError extends ExecutorError {
  issues?: ValidationResult<unknown>[];
}
