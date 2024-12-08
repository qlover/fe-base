export interface ExecutorContextInterface<Params = unknown> {
  /**
   * The error that occurred during the execution of the task
   */
  error?: Error;

  /**
   * The parameters passed to the task
   */
  parameters: Params;

  /**
   * The return value of the task
   */
  returnValue?: unknown;

  /**
   * TODO: Additional properties that can be added to the context
   */
  [key: string]: unknown;
}
