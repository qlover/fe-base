import { ExecutorError } from './ExecutorError';

export type TaskContext<T = unknown> = ExecutorContextInterface<T>;
export type AsyncTask<R, P = unknown> = (ctx: TaskContext<P>) => Promise<R>;
export type SyncTask<R, P = unknown> = (ctx: TaskContext<P>) => R;

export interface ExecutorContextInterface<T = unknown> {
  readonly parameters: T;
  readonly error: ExecutorError | undefined;
  readonly returnValue: unknown;

  setError(error: ExecutorError): void;
  setReturnValue(value: unknown): void;
  setParameters(params: T): void;
}

export interface ExecutorPluginInterface<
  Ctx extends TaskContext<unknown> = TaskContext<unknown>
  > {
  
  readonly pluginName?: string
  readonly onlyOne?: boolean;

  enabled(name: string | symbol, context?: Ctx): boolean;
}

export interface ExecutorInterface {
  use<Ctx extends TaskContext<unknown>>(
    plugin: ExecutorPluginInterface<Ctx>
  ): void;

  exec<R, P = unknown>(task: AsyncTask<R, P>): Promise<R>;

  exec<R, P = unknown>(data: P, task: AsyncTask<R, P>): Promise<R>;

  exec<R, P = unknown>(task: SyncTask<R, P>): R;

  exec<R, P = unknown>(data: P, task: SyncTask<R, P>): R;

  execNoError<R, P = unknown>(
    task: AsyncTask<R, P>
  ): Promise<R | ExecutorError>;

  execNoError<R, P = unknown>(
    data: P,
    task: AsyncTask<R, P>
  ): Promise<R | ExecutorError>;

  execNoError<R, P = unknown>(task: SyncTask<R, P>): R | ExecutorError;

  execNoError<R, P = unknown>(data: P, task: SyncTask<R, P>): R | ExecutorError;
}

export interface LifecyclePluginInterface<
  Ctx extends TaskContext<unknown> = TaskContext<unknown>
> extends ExecutorPluginInterface<Ctx> {
  onBefore?(ctx: Ctx): void | Promise<void>;
  onSuccess?(ctx: Ctx): void | Promise<void>;
  onError?(ctx: Ctx): void | Promise<void>;
}
