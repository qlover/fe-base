/**
 * Custom error class for executor operations
 * Provides structured error handling with error identification
 */
export class ExecutorError extends Error {
  constructor(
    public id: string,
    originalError?: string | Error
  ) {
    super(
      typeof originalError === 'string'
        ? originalError
        : originalError?.message || id
    );

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
