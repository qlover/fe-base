/**
 * Represents the context in which a task is executed.
 *
 * This interface is designed to encapsulate the necessary information
 * for executing a task, including parameters, potential errors, and
 * the return value. It allows for additional properties to be added
 * dynamically, making it flexible for various use cases.
 *
 * @template Params - The type of parameters that the task accepts.
 *
 * @since 1.0.14
 *
 * @example
 * ```typescript
 * const context: ExecutorContextInterface<MyParams> = {
 *   parameters: { id: 1 },
 *   error: null,
 *   returnValue: 'Success'
 * };
 * ```
 */
export interface ExecutorContext<Params = unknown> {
  /**
   * The error that occurred during the execution of the task.
   *
   * This property is optional and will be populated if an error
   * occurs during task execution.
   *
   * @type {Error | undefined}
   */
  error?: Error;

  /**
   * The parameters passed to the task.
   *
   * These parameters are used to execute the task and are of a generic
   * type, allowing for flexibility in the types of parameters that can
   * be passed.
   *
   * @type {Params}
   */
  parameters: Params;

  /**
   * The return value of the task.
   *
   * This property is optional and will contain the result of the task
   * execution if it completes successfully.
   *
   * @type {unknown | undefined}
   */
  returnValue?: unknown;

  /**
   * The runtime information of the task.
   *
   * The current runtime of each hook.
   *
   * This property is optional and will contain the runtime information
   * of the task if it is executed.
   *
   * property is read-only
   *
   * will return a frozen object that will be cleared after the chain execution is complete.
   *
   */
  hooksRuntimes: HookRuntimes;
}

export interface HookRuntimes {
  // readonly plugin: ExecutorPlugin;
  hookName?: string;

  /**
   * The return value of the task.
   *
   * Readonly
   */
  returnValue?: unknown;

  /**
   * 执行次数
   */
  times?: number;

  /**
   * 是否中断链
   */
  breakChain?: boolean;

  /**
   * 如果有返回值，是否中断链
   *
   * 一般常用于需要返回一个值时中断链,比如 onError 声明周期
   */
  returnBreakChain?: boolean;

  [key: string]: unknown;
}
