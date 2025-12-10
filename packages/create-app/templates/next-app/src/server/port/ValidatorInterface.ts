export interface ValidationFaildResult {
  path: PropertyKey[];
  message: string;
}

export interface ValidatorInterface {
  /**
   * Validate the data and return validation result
   * @param data - The data to validate
   * @returns true if validation passes, or ValidationError if validation fails
   */
  validate(
    data: unknown
  ): Promise<void | ValidationFaildResult> | void | ValidationFaildResult;

  /**
   * Get the data if it is valid, otherwise throw an error with validation details
   * @param data - The data to validate
   * @returns The data if it is valid
   * @throws {import('@qlover/fe-corekit').ExecutorError} if the data is invalid, with validation errors
   */
  getThrow<T>(data: unknown): T;
}
