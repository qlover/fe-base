import { describe, it, expect, beforeEach } from 'vitest';
import type {
  ExecutorAsyncTask,
  ExecutorSyncTask,
  ExecutorContextInterface,
  ExecutorPluginInterface,
  ExecutorInterface
} from '../../../src/executor/interface/ExecutorInterface';
import { ExecutorError } from '../../../src/executor/interface/ExecutorError';
import { LifecyclePluginInterface } from '../../../src/executor/interface/LifecyclePluginInterface';
import type { HookRuntimes } from '../../../src/executor/interface/ExecutorContext';

class MockExecutorError extends ExecutorError {
  constructor(message: string) {
    super(message);
    this.name = 'MockExecutorError';
  }
}

class MockExecutorContext<T, R = unknown>
  implements ExecutorContextInterface<T, R>
{
  private _parameters: T;
  private _error: unknown;
  private _returnValue?: R;
  private _hooksRuntimes: HookRuntimes = {
    pluginName: '',
    hookName: '',
    returnValue: undefined,
    returnBreakChain: false,
    times: 0,
    breakChain: false,
    pluginIndex: undefined,
    continueOnError: false
  };

  constructor(initialParams: T) {
    this._parameters = initialParams;
    this._error = undefined;
    this._returnValue = undefined;
  }

  public get parameters(): T {
    return this._parameters;
  }

  public get error(): unknown {
    return this._error;
  }

  public get returnValue(): R {
    return this._returnValue as R;
  }

  public setError(error: unknown): void {
    this._error = error;
  }

  public setReturnValue(value: R): void {
    this._returnValue = value;
  }

  public setParameters(params: T): void {
    this._parameters = params;
  }

  public resetHooksRuntimes(hookName?: string): void {
    if (hookName) {
      // Reset only specific hook
      if (this._hooksRuntimes.hookName === hookName) {
        this._hooksRuntimes = {
          ...this._hooksRuntimes,
          pluginName: '',
          hookName: '',
          returnValue: undefined,
          returnBreakChain: false,
          times: 0,
          breakChain: false,
          pluginIndex: undefined
        };
      }
    } else {
      // Reset all
      this._hooksRuntimes = {
        pluginName: '',
        hookName: '',
        returnValue: undefined,
        returnBreakChain: false,
        times: 0,
        breakChain: false,
        pluginIndex: undefined,
        continueOnError: false
      };
    }
  }

  public reset(): void {
    this.resetHooksRuntimes();
    this._returnValue = undefined;
    this._error = undefined;
  }

  public shouldSkipPluginHook<
    Ctx extends ExecutorContextInterface<unknown, unknown>
  >(plugin: ExecutorPluginInterface<Ctx>, hookName: string): boolean {
    const hookMethod = plugin[hookName as keyof ExecutorPluginInterface<Ctx>];
    return (
      typeof hookMethod !== 'function' ||
      (plugin.enabled !== undefined &&
        !plugin.enabled(hookName, this as unknown as Ctx))
    );
  }

  public get hooksRuntimes(): Readonly<HookRuntimes> {
    return Object.freeze({ ...this._hooksRuntimes });
  }

  public runtimes(runtimes: Partial<HookRuntimes>): void {
    this._hooksRuntimes = {
      ...this._hooksRuntimes,
      ...runtimes
    };
  }

  public runtimeReturnValue(returnValue: unknown): void {
    this._hooksRuntimes.returnValue = returnValue;
  }

  public shouldBreakChain(): boolean {
    return !!this._hooksRuntimes?.breakChain;
  }

  public shouldBreakChainOnReturn(): boolean {
    return !!this._hooksRuntimes?.returnBreakChain;
  }

  public shouldContinueOnError(): boolean {
    return !!this._hooksRuntimes?.continueOnError;
  }
}

class TestPlugin
  implements ExecutorPluginInterface<ExecutorContextInterface<unknown, unknown>>
{
  public readonly pluginName = 'TestPlugin';
  private _callCount = 0;

  public enabled(
    name: string | symbol,
    _context?: ExecutorContextInterface<unknown, unknown>
  ): boolean {
    this._callCount++;
    return name !== 'skip';
  }

  public get callCount(): number {
    return this._callCount;
  }
}

class MockExecutor
  implements
    ExecutorInterface<
      ExecutorPluginInterface<ExecutorContextInterface<unknown, unknown>>
    >
{
  private plugins: ExecutorPluginInterface<
    ExecutorContextInterface<unknown, unknown>
  >[] = [];

  public use(
    plugin: ExecutorPluginInterface<ExecutorContextInterface<unknown, unknown>>
  ): void {
    this.plugins.push(
      plugin as ExecutorPluginInterface<
        ExecutorContextInterface<unknown, unknown>
      >
    );
  }

  public exec<R, P = unknown>(task: ExecutorAsyncTask<R, P>): Promise<R>;
  public exec<R, P = unknown>(
    data: P,
    task: ExecutorAsyncTask<R, P>
  ): Promise<R>;
  public exec<R, P = unknown>(task: ExecutorSyncTask<R, P>): R;
  public exec<R, P = unknown>(data: P, task: ExecutorSyncTask<R, P>): R;
  public exec<R, P = unknown>(
    taskOrData: ExecutorAsyncTask<R, P> | ExecutorSyncTask<R, P> | P,
    task?: ExecutorAsyncTask<R, P> | ExecutorSyncTask<R, P>
  ): R | Promise<R> {
    if (task !== undefined) {
      const data = taskOrData as P;
      return this.executeWithData(data, task);
    } else {
      const taskOnly = taskOrData as
        | ExecutorAsyncTask<R, P>
        | ExecutorSyncTask<R, P>;
      return this.executeWithoutData(taskOnly);
    }
  }

  public execNoError<R, P = unknown>(
    task: ExecutorAsyncTask<R, P>
  ): Promise<R | ExecutorError>;
  public execNoError<R, P = unknown>(
    data: P,
    task: ExecutorAsyncTask<R, P>
  ): Promise<R | ExecutorError>;
  public execNoError<R, P = unknown>(
    task: ExecutorSyncTask<R, P>
  ): R | ExecutorError;
  public execNoError<R, P = unknown>(
    data: P,
    task: ExecutorSyncTask<R, P>
  ): R | ExecutorError;
  public execNoError<R, P = unknown>(
    taskOrData: ExecutorAsyncTask<R, P> | ExecutorSyncTask<R, P> | P,
    task?: ExecutorAsyncTask<R, P> | ExecutorSyncTask<R, P>
  ): (R | ExecutorError) | Promise<R | ExecutorError> {
    try {
      const result = this.exec(taskOrData as any, task as any) as
        | R
        | Promise<R>;
      if (result instanceof Promise) {
        return result.catch(
          (error) => new MockExecutorError(error.message)
        ) as Promise<R | ExecutorError>;
      }
      return result as R | ExecutorError;
    } catch (error) {
      return new MockExecutorError(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  private createContext<P, R = unknown>(
    params: P
  ): ExecutorContextInterface<P, R> {
    return new MockExecutorContext<P, R>(params) as ExecutorContextInterface<
      P,
      R
    >;
  }

  private executeWithData<R, P>(
    data: P,
    task: ExecutorAsyncTask<R, P> | ExecutorSyncTask<R, P>
  ): R | Promise<R> {
    const context = this.createContext<P, R>(data);

    const shouldExecute = this.plugins.every((plugin) =>
      plugin.enabled?.('test', context)
    );
    if (!shouldExecute) {
      throw new MockExecutorError('Plugin blocked execution');
    }

    const result = task(context);
    if (result instanceof Promise) {
      return result.then((value) => {
        context.setReturnValue(value);
        return value;
      });
    }

    context.setReturnValue(result);
    return result;
  }

  private executeWithoutData<R, P>(
    task: ExecutorAsyncTask<R, P> | ExecutorSyncTask<R, P>
  ): R | Promise<R> {
    return this.executeWithData(undefined as P, task);
  }
}

describe('Executor Types', () => {
  let executor: ExecutorInterface<
    ExecutorPluginInterface<ExecutorContextInterface<unknown, unknown>>
  >;
  let plugin: TestPlugin;

  beforeEach(() => {
    executor = new MockExecutor();
    plugin = new TestPlugin();
    executor.use(plugin);
  });

  describe('ExecutorContextInterface Types', () => {
    it('should correctly handle generic ExecutorContextInterface', () => {
      interface UserData {
        id: number;
        name: string;
      }

      const context: ExecutorContextInterface<UserData, unknown> =
        new MockExecutorContext<UserData, unknown>({
          id: 1,
          name: 'John'
        });

      expect(context.parameters.id).toBe(1);
      expect(context.parameters.name).toBe('John');

      // This should cause a compile-time error if uncommented
      // const wrongAccess: number = context.parameters.name; // Error: Type 'string' is not assignable to type 'number'

      context.setParameters({ id: 2, name: 'Jane' });
      expect(context.parameters.id).toBe(2);

      // This should cause a compile-time error if uncommented
      // context.setParameters({ id: 3, name: 123 }); // Error: Type 'number' is not assignable to type 'string'
    });
  });

  describe('AsyncTask Types', () => {
    it('should correctly type async tasks', async () => {
      const asyncUserTask: ExecutorAsyncTask<
        string,
        { userId: number }
      > = async (ctx) => {
        const { userId } = ctx.parameters;
        return `User ${userId} processed`;
      };

      const result1 = executor.exec({ userId: 123 }, asyncUserTask);
      expect(result1).toBeInstanceOf(Promise);

      const value1 = await result1;
      expect(typeof value1).toBe('string');
      expect(value1).toBe('User 123 processed');

      const result2 = await executor.exec(async (ctx) => {
        const params = (ctx.parameters ?? {}) as { userId?: number };
        return `User ${params.userId ?? 0} processed`;
      });
      expect(typeof result2).toBe('string');
      expect(result2).toBe('User 0 processed');
    });

    it('should handle async task errors with execNoError', async () => {
      const failingAsyncTask: ExecutorAsyncTask<
        string,
        { id: number }
      > = async (ctx) => {
        if (ctx.parameters.id === 0) {
          throw new Error('Invalid ID');
        }
        return `Success: ${ctx.parameters.id}`;
      };

      const result1 = await executor.execNoError({ id: 1 }, failingAsyncTask);
      expect(result1).toBe('Success: 1');

      const result2 = await executor.execNoError({ id: 0 }, failingAsyncTask);
      expect(result2).toBeInstanceOf(Error);
      expect((result2 as ExecutorError).message).toBe('Invalid ID');
    });
  });

  describe('SyncTask Types', () => {
    it('should correctly type sync tasks', () => {
      const syncCalculationTask: ExecutorSyncTask<
        number,
        { a: number; b: number }
      > = (ctx) => {
        const { a, b } = ctx.parameters;
        return a + b;
      };

      const result1 = executor.exec({ a: 10, b: 20 }, syncCalculationTask);
      expect(typeof result1).toBe('number');
      expect(result1).toBe(30);

      // This should cause a compile-time error if uncommented
      // const result2: string = executor.exec({ a: 1, b: 2 }, syncCalculationTask); // Error: Type 'number' is not assignable to type 'string'

      // When only task is provided, P defaults to unknown
      const syncTaskWithUnknown: ExecutorSyncTask<number, unknown> = (ctx) => {
        const params = (ctx.parameters ?? {}) as { a?: number; b?: number };
        return (params.a ?? 0) + (params.b ?? 0);
      };
      const result3 = executor.exec(syncTaskWithUnknown);
      expect(typeof result3).toBe('number');
      expect(result3).toBe(0);
    });

    it('should handle sync task errors with execNoError', () => {
      const failingSyncTask: ExecutorSyncTask<string, { value: number }> = (
        ctx
      ) => {
        if (ctx.parameters.value < 0) {
          throw new Error('Negative value');
        }
        return `Value: ${ctx.parameters.value}`;
      };

      const result1 = executor.execNoError({ value: 5 }, failingSyncTask);
      expect(result1).toBe('Value: 5');

      const result2 = executor.execNoError({ value: -5 }, failingSyncTask);
      expect(result2).toBeInstanceOf(Error);
      expect((result2 as ExecutorError).message).toBe('Negative value');
    });
  });

  describe('Type Inference', () => {
    it('should infer sync return type for sync tasks', () => {
      const syncTask: ExecutorSyncTask<number, { x: number }> = (ctx) =>
        ctx.parameters.x * 2;

      // Type should be inferred as number, not Promise<number>
      const result = executor.exec({ x: 5 }, syncTask);
      expect(typeof result).toBe('number');
      expect(result).toBe(10);

      // This should cause a compile-time error if uncommented
      // const wrongType: Promise<number> = executor.exec({ x: 5 }, syncTask); // Error: Type 'number' is not assignable to type 'Promise<number>'
      // const wrongType2: string = executor.exec({ x: 5 }, syncTask); // Error: Type 'number' is not assignable to type 'string'
    });

    it('should infer async return type (Promise) for async tasks', async () => {
      // Type should be inferred as Promise<string>, not string
      const result = executor.exec(
        { id: 123 },
        async (ctx) => `ID: ${ctx.parameters.id}`
      );
      expect(result).toBeInstanceOf(Promise);

      const value = await result;
      expect(typeof value).toBe('string');
      expect(value).toBe('ID: 123');

      // This should cause a compile-time error if uncommented
      // const wrongType: string = executor.exec({ id: 123 }, asyncTask); // Error: Type 'Promise<string>' is not assignable to type 'string'
    });

    it('should correctly infer types for sync task without data parameter', () => {
      // Type should be inferred as boolean
      const result = executor.exec(() => true);
      expect(typeof result).toBe('boolean');
      expect(result).toBe(true);

      // This should cause a compile-time error if uncommented
      // const wrongType: Promise<boolean> = executor.exec(syncTask); // Error: Type 'boolean' is not assignable to type 'Promise<boolean>'
    });

    it('should correctly infer types for async task without data parameter', async () => {
      const asyncTask: ExecutorAsyncTask<number, unknown> = async () => 42;

      // Type should be inferred as Promise<number>
      const result = executor.exec(asyncTask);
      expect(result).toBeInstanceOf(Promise);

      const value = await result;
      expect(typeof value).toBe('number');
      expect(value).toBe(42);
    });

    it('should infer complex return types correctly', () => {
      interface ComplexResult {
        data: string[];
        count: number;
      }

      const syncComplexTask: ExecutorSyncTask<
        ComplexResult,
        { items: string[] }
      > = (ctx) => ({
        data: ctx.parameters.items,
        count: ctx.parameters.items.length
      });

      // Type should be inferred as ComplexResult
      const result = executor.exec({ items: ['a', 'b', 'c'] }, syncComplexTask);
      expect(result.data).toEqual(['a', 'b', 'c']);
      expect(result.count).toBe(3);
      expect(typeof result).toBe('object');
      expect(result).not.toBeInstanceOf(Promise);
    });

    it('should infer complex async return types correctly', async () => {
      interface ComplexResult {
        data: string[];
        count: number;
      }

      const asyncComplexTask: ExecutorAsyncTask<
        ComplexResult,
        { items: string[] }
      > = async (ctx) => ({
        data: ctx.parameters.items,
        count: ctx.parameters.items.length
      });

      // Type should be inferred as Promise<ComplexResult>
      const result = executor.exec(
        { items: ['x', 'y', 'z'] },
        asyncComplexTask
      );
      expect(result).toBeInstanceOf(Promise);

      const value = await result;
      expect(value.data).toEqual(['x', 'y', 'z']);
      expect(value.count).toBe(3);
    });

    it('should infer void return type for sync tasks', () => {
      const voidSyncTask: ExecutorSyncTask<void, { message: string }> = (
        _ctx
      ) => {
        // console.log(ctx.parameters.message);
      };

      // Type should be inferred as void
      const result = executor.exec({ message: 'test' }, voidSyncTask);
      expect(result).toBeUndefined();

      // This should cause a compile-time error if uncommented
      // const wrongType: string = executor.exec({ message: 'test' }, voidSyncTask); // Error: Type 'void' is not assignable to type 'string'
    });

    it('should infer void return type for async tasks', async () => {
      const voidAsyncTask: ExecutorAsyncTask<
        void,
        { message: string }
      > = async (_ctx) => {
        // console.log(ctx.parameters.message);
      };

      // Type should be inferred as Promise<void>
      const result = executor.exec({ message: 'test' }, voidAsyncTask);
      expect(result).toBeInstanceOf(Promise);

      const value = await result;
      expect(value).toBeUndefined();
    });

    it('should maintain type inference through method chaining', () => {
      const syncTask: ExecutorSyncTask<number, { n: number }> = (ctx) =>
        ctx.parameters.n * 2;

      // Type inference should work correctly
      const result = executor.exec({ n: 5 }, syncTask);
      const doubled = result * 2;
      expect(doubled).toBe(20);
      expect(typeof doubled).toBe('number');
    });

    it('should maintain type inference for async through await', async () => {
      const asyncTask: ExecutorAsyncTask<number, { n: number }> = async (ctx) =>
        ctx.parameters.n * 2;

      // Type inference should work correctly with await
      const result = await executor.exec({ n: 5 }, asyncTask);
      const doubled = result * 2;
      expect(doubled).toBe(20);
      expect(typeof doubled).toBe('number');
      expect(typeof result).toBe('number');
    });

    it('should correctly infer union return types', () => {
      type Result = 'success' | 'failure';

      const syncUnionTask: ExecutorSyncTask<Result, { flag: boolean }> = (
        ctx
      ) => (ctx.parameters.flag ? 'success' : 'failure');

      // Type should be inferred as Result ('success' | 'failure')
      const result1 = executor.exec({ flag: true }, syncUnionTask);
      expect(result1).toBe('success');

      const result2 = executor.exec({ flag: false }, syncUnionTask);
      expect(result2).toBe('failure');

      // Type should not be Promise
      expect(result1).not.toBeInstanceOf(Promise);
      expect(result2).not.toBeInstanceOf(Promise);
    });

    it('should correctly infer generic return types', () => {
      interface ApiResponse<T> {
        data: T;
        status: number;
      }

      const syncGenericTask: ExecutorSyncTask<
        ApiResponse<string>,
        { endpoint: string }
      > = (ctx) => ({
        data: ctx.parameters.endpoint,
        status: 200
      });

      // Type should be inferred as ApiResponse<string>
      const result = executor.exec({ endpoint: '/api/test' }, syncGenericTask);
      expect(result.data).toBe('/api/test');
      expect(result.status).toBe(200);
      expect(typeof result.data).toBe('string');
      expect(result).not.toBeInstanceOf(Promise);
    });

    it('should correctly infer generic async return types', async () => {
      interface ApiResponse<T> {
        data: T;
        status: number;
      }

      const asyncGenericTask: ExecutorAsyncTask<
        ApiResponse<number[]>,
        { ids: number[] }
      > = async (ctx) => ({
        data: ctx.parameters.ids,
        status: 200
      });

      // Type should be inferred as Promise<ApiResponse<number[]>>
      const result = executor.exec({ ids: [1, 2, 3] }, asyncGenericTask);
      expect(result).toBeInstanceOf(Promise);

      const value = await result;
      expect(value.data).toEqual([1, 2, 3]);
      expect(value.status).toBe(200);
    });
  });

  describe('Plugin System Types', () => {
    it('should correctly type plugins', () => {
      const customPlugin: ExecutorPluginInterface<
        ExecutorContextInterface<{ id: number }, unknown>
      > = {
        pluginName: 'CustomPlugin',
        enabled(
          _name: string | symbol,
          context?: ExecutorContextInterface<{ id: number }, unknown>
        ) {
          if (context && context.parameters.id === 999) {
            return false;
          }
          return true;
        }
      };

      executor.use(customPlugin);

      const task: ExecutorSyncTask<string, { id: number }> = (ctx) =>
        `ID: ${ctx.parameters.id}`;

      const result1 = executor.exec({ id: 123 }, task);
      expect(result1).toBe('ID: 123');

      const result2 = executor.execNoError({ id: 999 }, task);
      expect(result2).toBeInstanceOf(Error);
      expect((result2 as ExecutorError).message).toBe(
        'Plugin blocked execution'
      );
    });
  });

  describe('LifecyclePluginInterface Types', () => {
    it('should correctly type lifecycle plugins with sync hooks', () => {
      interface UserData {
        id: number;
        name: string;
      }

      const lifecyclePlugin: LifecyclePluginInterface<
        ExecutorContextInterface<UserData, unknown>
      > = {
        pluginName: 'LifecyclePlugin',
        enabled(
          _name: string | symbol,
          _context?: ExecutorContextInterface<UserData, unknown>
        ): boolean {
          return true;
        },
        onBefore(ctx: ExecutorContextInterface<UserData, unknown>) {
          expect(ctx.parameters.id).toBeDefined();
          expect(ctx.parameters.name).toBeDefined();
        },
        onSuccess(ctx: ExecutorContextInterface<UserData, unknown>) {
          expect(ctx.returnValue).toBeDefined();
        },
        onError(_ctx: ExecutorContextInterface<UserData, unknown>) {
          // ctx.error is ExecutorError | undefined
        }
      };

      expect(lifecyclePlugin.onBefore).toBeDefined();
      expect(lifecyclePlugin.onSuccess).toBeDefined();
      expect(lifecyclePlugin.onError).toBeDefined();

      const context = new MockExecutorContext<UserData, unknown>({
        id: 1,
        name: 'John'
      });
      context.setReturnValue('User 1 processed' as unknown);

      lifecyclePlugin.onBefore?.(context);
      lifecyclePlugin.onSuccess?.(context);

      // This should cause a compile-time error if uncommented
      // lifecyclePlugin.onBefore?.({ parameters: { id: 'wrong' } } as ExecutorContextInterface<UserData>); // Error: Type 'string' is not assignable to type 'number'
    });

    it('should correctly type lifecycle plugins with async hooks', async () => {
      interface ProcessData {
        value: number;
      }

      let onBeforeCalled = false;
      let onSuccessCalled = false;

      const asyncLifecyclePlugin: LifecyclePluginInterface<
        ExecutorContextInterface<ProcessData, unknown>
      > = {
        pluginName: 'AsyncLifecyclePlugin',
        enabled(
          _name: string | symbol,
          _context?: ExecutorContextInterface<ProcessData, unknown>
        ): boolean {
          return true;
        },
        async onBefore(ctx: ExecutorContextInterface<ProcessData, unknown>) {
          await new Promise((resolve) => setTimeout(resolve, 10));
          onBeforeCalled = true;
          expect(ctx.parameters.value).toBe(42);
        },
        async onSuccess(ctx: ExecutorContextInterface<ProcessData, unknown>) {
          await new Promise((resolve) => setTimeout(resolve, 10));
          onSuccessCalled = true;
          expect(ctx.returnValue).toBe(84);
        }
      };

      // Async hooks should return Promise<void>
      const beforeResult = asyncLifecyclePlugin.onBefore?.(
        new MockExecutorContext<ProcessData, unknown>({ value: 42 })
      );
      expect(beforeResult).toBeInstanceOf(Promise);
      await beforeResult;

      const successContext = new MockExecutorContext<ProcessData, unknown>({
        value: 42
      });
      successContext.setReturnValue(84 as unknown);
      const successResult = asyncLifecyclePlugin.onSuccess?.(successContext);
      successResult && (await successResult);

      expect(onBeforeCalled).toBe(true);
      expect(onSuccessCalled).toBe(true);
    });

    it('should handle optional lifecycle hooks', () => {
      // enabled is required (inherited from ExecutorPluginInterface), lifecycle hooks are optional
      const partialPlugin: LifecyclePluginInterface<
        ExecutorContextInterface<unknown, unknown>
      > = {
        pluginName: 'PartialPlugin',
        enabled(
          _name: string | symbol,
          _context?: ExecutorContextInterface<unknown, unknown>
        ): boolean {
          return true;
        },
        onBefore(ctx) {
          expect(ctx.parameters).toBeDefined();
        }
      };

      expect(partialPlugin.enabled).toBeDefined();
      expect(partialPlugin.onBefore).toBeDefined();
      expect(partialPlugin.onSuccess).toBeUndefined();
      expect(partialPlugin.onError).toBeUndefined();

      const minimalPlugin: LifecyclePluginInterface<
        ExecutorContextInterface<unknown, unknown>
      > = {
        pluginName: 'MinimalPlugin',
        enabled(
          _name: string | symbol,
          _context?: ExecutorContextInterface<unknown, unknown>
        ): boolean {
          return true;
        }
      };

      expect(minimalPlugin.enabled).toBeDefined();
      expect(minimalPlugin.onBefore).toBeUndefined();
      expect(minimalPlugin.onSuccess).toBeUndefined();
      expect(minimalPlugin.onError).toBeUndefined();
    });

    it('should correctly type lifecycle plugins with generic context', () => {
      interface ApiParams {
        endpoint: string;
        method: string;
      }

      const apiLifecyclePlugin: LifecyclePluginInterface<
        ExecutorContextInterface<ApiParams, unknown>
      > = {
        pluginName: 'ApiLifecyclePlugin',
        enabled(
          _name: string | symbol,
          _context?: ExecutorContextInterface<ApiParams, unknown>
        ): boolean {
          return true;
        },
        onBefore(ctx) {
          expect(typeof ctx.parameters.endpoint).toBe('string');
          expect(typeof ctx.parameters.method).toBe('string');
        },
        onSuccess(ctx) {
          expect(ctx.returnValue).toBeDefined();
        },
        onError(ctx) {
          if (ctx.error) {
            expect(ctx.error).toBeInstanceOf(ExecutorError);
          }
        }
      };

      const context = new MockExecutorContext<ApiParams, unknown>({
        endpoint: '/api/users',
        method: 'GET'
      });

      apiLifecyclePlugin.onBefore?.(context);
      expect(context.parameters.endpoint).toBe('/api/users');
      expect(context.parameters.method).toBe('GET');
    });

    it('should handle lifecycle plugins with different context types', () => {
      const stringPlugin: LifecyclePluginInterface<
        ExecutorContextInterface<string, unknown>
      > = {
        pluginName: 'StringPlugin',
        enabled(
          _name: string | symbol,
          _context?: ExecutorContextInterface<string, unknown>
        ): boolean {
          return true;
        },
        onBefore(ctx) {
          expect(typeof ctx.parameters).toBe('string');
        }
      };

      const numberPlugin: LifecyclePluginInterface<
        ExecutorContextInterface<number, unknown>
      > = {
        pluginName: 'NumberPlugin',
        enabled(
          _name: string | symbol,
          _context?: ExecutorContextInterface<number, unknown>
        ): boolean {
          return true;
        },
        onBefore(ctx) {
          expect(typeof ctx.parameters).toBe('number');
        }
      };

      interface ComplexParams {
        nested: {
          value: string;
        };
      }
      const complexPlugin: LifecyclePluginInterface<
        ExecutorContextInterface<ComplexParams, unknown>
      > = {
        pluginName: 'ComplexPlugin',
        enabled(
          _name: string | symbol,
          _context?: ExecutorContextInterface<ComplexParams, unknown>
        ): boolean {
          return true;
        },
        onBefore(ctx) {
          expect(ctx.parameters.nested.value).toBeDefined();
        }
      };

      stringPlugin.onBefore?.(new MockExecutorContext<string, unknown>('test'));
      numberPlugin.onBefore?.(new MockExecutorContext<number, unknown>(123));
      complexPlugin.onBefore?.(
        new MockExecutorContext<ComplexParams, unknown>({
          nested: { value: 'test' }
        })
      );
    });

    it('should verify type safety at compile time for lifecycle plugins', () => {
      interface StrictParams {
        id: number;
        name: string;
      }

      const strictPlugin: LifecyclePluginInterface<
        ExecutorContextInterface<StrictParams, unknown>
      > = {
        pluginName: 'StrictPlugin',
        enabled(
          _name: string | symbol,
          _context?: ExecutorContextInterface<StrictParams, unknown>
        ): boolean {
          return true;
        },
        onBefore(ctx) {
          const _id = ctx.parameters.id;
          const _name = ctx.parameters.name;
        }
      };

      // This should cause a compile-time error if uncommented
      // const wrongPlugin: LifecyclePluginInterface<ExecutorContextInterface<StrictParams>> = {
      //   onBefore(ctx) {
      //     const wrong = ctx.parameters.wrongProperty; // Error: Property 'wrongProperty' does not exist
      //   }
      // };

      expect(strictPlugin).toBeDefined();
    });
  });

  describe('Complex Generic Scenarios', () => {
    it('should handle nested generics', () => {
      interface PaginationParams {
        page: number;
        limit: number;
      }

      interface ApiResponse<T> {
        data: T[];
        total: number;
      }

      const fetchDataTask: ExecutorAsyncTask<
        ApiResponse<{ id: number; name: string }>,
        PaginationParams
      > = async (_ctx) => {
        return {
          data: [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' }
          ],
          total: 100
        };
      };

      const resultPromise = executor.exec(
        {
          page: 1,
          limit: 20
        },
        fetchDataTask
      );
      expect(resultPromise).toBeInstanceOf(Promise);

      resultPromise.then(
        (result: ApiResponse<{ id: number; name: string }>) => {
          expect(result.data).toHaveLength(2);
          expect(result.total).toBe(100);
          expect(result.data[0].id).toBe(1);
          expect(typeof result.data[0].name).toBe('string');
        }
      );
    });

    it('should handle tasks with void return type', () => {
      const loggingTask: ExecutorSyncTask<void, { message: string }> = (
        _ctx
      ) => {
        // console.log(ctx.parameters.message);
      };

      const result = executor.exec({ message: 'Test log' }, loggingTask);
      expect(result).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle unknown parameter type', () => {
      const task: ExecutorSyncTask<string, unknown> = (ctx) => {
        const params = ctx.parameters as { value: string };
        return `Value: ${params.value}`;
      };

      const result = executor.exec({ value: 'test' }, task);
      expect(result).toBe('Value: test');
    });

    it('should handle tasks without parameters', () => {
      const noParamTask: ExecutorSyncTask<string, undefined> = (_ctx) => {
        return 'No params';
      };

      const result = executor.exec(undefined, noParamTask);
      expect(result).toBe('No params');
    });

    it('should verify type safety at compile time', () => {
      // These tests verify compile-time type checking
      // Type errors will be caught during compilation

      const _task1: ExecutorSyncTask<string, { id: number }> = (ctx) =>
        `ID: ${ctx.parameters.id}`;

      // This should cause a compile-time error if uncommented
      // executor.exec({ id: 'not-a-number' }, task1); // Error: Type 'string' is not assignable to type 'number'

      const _task2: ExecutorSyncTask<number, { value: number }> = (ctx) =>
        ctx.parameters.value * 2;

      // This should cause a compile-time error if uncommented
      // const result: string = executor.exec({ value: 5 }, task2); // Error: Type 'number' is not assignable to type 'string'

      const pluginForString: ExecutorPluginInterface<
        ExecutorContextInterface<string, unknown>
      > = {
        pluginName: 'PluginForString',
        enabled(_name, context) {
          return (context?.parameters.length ?? 0) > 0;
        }
      };

      // This works because Ctx extends ExecutorContextInterface<unknown>
      executor.use(pluginForString);

      const _stringTask: ExecutorSyncTask<string, string> = (ctx) =>
        ctx.parameters.toUpperCase();
      const _numberTask: ExecutorSyncTask<number, number> = (ctx) =>
        ctx.parameters * 2;

      executor.use(pluginForString);
      // This won't cause a compile error, but may cause runtime issues due to type mismatch
    });
  });

  describe('Extended and Inherited Types', () => {
    describe('Extended Context Types', () => {
      it('should correctly type extended context with additional properties', () => {
        interface BaseParams {
          id: number;
        }

        interface ExtendedParams extends BaseParams {
          name: string;
          metadata?: Record<string, unknown>;
        }

        class ExtendedContext<T extends ExtendedParams>
          extends MockExecutorContext<T, unknown>
          implements ExecutorContextInterface<T, unknown>
        {
          private _metadata: Record<string, unknown> = {};

          constructor(params: T) {
            super(params);
            this._metadata = params.metadata ?? {};
          }

          public get metadata(): Record<string, unknown> {
            return this._metadata;
          }

          public setMetadata(key: string, value: unknown): void {
            this._metadata[key] = value;
          }
        }

        const extendedContext = new ExtendedContext<ExtendedParams>({
          id: 1,
          name: 'Test',
          metadata: { version: '1.0' }
        });

        expect(extendedContext.parameters.id).toBe(1);
        expect(extendedContext.parameters.name).toBe('Test');
        expect(extendedContext.metadata.version).toBe('1.0');

        const context: ExecutorContextInterface<ExtendedParams, unknown> =
          extendedContext;
        expect(context.parameters.id).toBe(1);
        expect(context.parameters.name).toBe('Test');
      });

      it('should correctly type nested extended context', () => {
        interface BaseParams {
          base: string;
        }

        interface Level1Params extends BaseParams {
          level1: number;
        }

        interface Level2Params extends Level1Params {
          level2: boolean;
        }

        class MultiLevelContext<T extends Level2Params>
          extends MockExecutorContext<T, unknown>
          implements ExecutorContextInterface<T, unknown>
        {
          public getLevel1Value(): number {
            return this.parameters.level1;
          }

          public getLevel2Value(): boolean {
            return this.parameters.level2;
          }
        }

        const multiContext = new MultiLevelContext<Level2Params>({
          base: 'base',
          level1: 1,
          level2: true
        });

        expect(multiContext.parameters.base).toBe('base');
        expect(multiContext.parameters.level1).toBe(1);
        expect(multiContext.parameters.level2).toBe(true);
        expect(multiContext.getLevel1Value()).toBe(1);
        expect(multiContext.getLevel2Value()).toBe(true);
      });
    });

    describe('Inherited Context Types', () => {
      it('should correctly type inherited context with method overrides', () => {
        interface UserParams {
          userId: number;
          username: string;
        }

        class InheritedContext<T extends UserParams>
          extends MockExecutorContext<T, unknown>
          implements ExecutorContextInterface<T, unknown>
        {
          public override setParameters(params: T): void {
            if (params.userId <= 0) {
              throw new Error('Invalid userId');
            }
            super.setParameters(params);
          }

          public getUserInfo(): string {
            return `User ${this.parameters.userId}: ${this.parameters.username}`;
          }
        }

        const inheritedContext = new InheritedContext<UserParams>({
          userId: 123,
          username: 'testuser'
        });

        expect(inheritedContext.getUserInfo()).toBe('User 123: testuser');

        inheritedContext.setParameters({ userId: 456, username: 'newuser' });
        expect(inheritedContext.parameters.userId).toBe(456);
        expect(inheritedContext.parameters.username).toBe('newuser');

        expect(() => {
          inheritedContext.setParameters({ userId: -1, username: 'invalid' });
        }).toThrow('Invalid userId');
      });

      it('should correctly type context with generic constraints', () => {
        interface Identifiable {
          id: number | string;
        }

        class IdentifiableContext<T extends Identifiable>
          extends MockExecutorContext<T, unknown>
          implements ExecutorContextInterface<T, unknown>
        {
          public getId(): number | string {
            return this.parameters.id;
          }

          public isNumericId(): boolean {
            return typeof this.parameters.id === 'number';
          }
        }

        const numericContext = new IdentifiableContext<{
          id: number;
          name: string;
        }>({
          id: 123,
          name: 'test'
        });

        const stringContext = new IdentifiableContext<{
          id: string;
          code: string;
        }>({
          id: 'abc',
          code: 'test'
        });

        expect(numericContext.getId()).toBe(123);
        expect(numericContext.isNumericId()).toBe(true);

        expect(stringContext.getId()).toBe('abc');
        expect(stringContext.isNumericId()).toBe(false);
      });
    });

    describe('Extended Plugin Types', () => {
      it('should correctly type extended plugin with additional methods', () => {
        interface ApiParams {
          endpoint: string;
          method: string;
        }

        class ExtendedPlugin
          implements
            ExecutorPluginInterface<ExecutorContextInterface<ApiParams, unknown>>
        {
          public readonly pluginName = 'ExtendedPlugin';
          private _callHistory: string[] = [];

          public enabled(
            _name: string | symbol,
            context?: ExecutorContextInterface<ApiParams, unknown>
          ): boolean {
            if (context) {
              this._callHistory.push(
                `${context.parameters.method} ${context.parameters.endpoint}`
              );
            }
            return true;
          }

          public getCallHistory(): string[] {
            return this._callHistory;
          }

          public clearHistory(): void {
            this._callHistory = [];
          }
        }

        const extendedPlugin = new ExtendedPlugin();
        executor.use(extendedPlugin);

        const context = new MockExecutorContext<ApiParams, unknown>({
          endpoint: '/api/users',
          method: 'GET'
        });

        extendedPlugin.enabled('test', context);
        expect(extendedPlugin.getCallHistory()).toContain('GET /api/users');

        extendedPlugin.clearHistory();
        expect(extendedPlugin.getCallHistory()).toHaveLength(0);
      });

      it('should correctly type plugin with lifecycle methods extension', () => {
        interface ProcessParams {
          data: unknown;
        }

        class LifecycleExtendedPlugin
          implements
            LifecyclePluginInterface<
              ExecutorContextInterface<ProcessParams, unknown>
            >
        {
          public readonly pluginName = 'LifecycleExtendedPlugin';
          private _beforeCount = 0;
          private _successCount = 0;
          private _errorCount = 0;

          public enabled(
            _name: string | symbol,
            _context?: ExecutorContextInterface<ProcessParams, unknown>
          ): boolean {
            return true;
          }

          public onBefore(
            _ctx: ExecutorContextInterface<ProcessParams, unknown>
          ): void {
            this._beforeCount++;
          }

          public onSuccess(
            _ctx: ExecutorContextInterface<ProcessParams, unknown>
          ): void {
            this._successCount++;
          }

          public onError(
            _ctx: ExecutorContextInterface<ProcessParams, unknown>
          ): void {
            this._errorCount++;
          }

          public getStats(): {
            before: number;
            success: number;
            error: number;
          } {
            return {
              before: this._beforeCount,
              success: this._successCount,
              error: this._errorCount
            };
          }
        }

        const lifecyclePlugin = new LifecycleExtendedPlugin();
        const context = new MockExecutorContext<ProcessParams, unknown>({
          data: 'test'
        });

        lifecyclePlugin.onBefore(context);
        lifecyclePlugin.onSuccess(context);

        const stats = lifecyclePlugin.getStats();
        expect(stats.before).toBe(1);
        expect(stats.success).toBe(1);
        expect(stats.error).toBe(0);
      });
    });

    describe('Inherited Plugin Types', () => {
      it('should correctly type inherited plugin with method overrides', () => {
        interface AuthParams {
          token: string;
          userId: number;
        }

        class BaseAuthPlugin
          implements
            ExecutorPluginInterface<
              ExecutorContextInterface<AuthParams, unknown>
            >
        {
          public readonly pluginName = 'BaseAuthPlugin';
          protected _isAuthenticated = false;

          public enabled(
            _name: string | symbol,
            context?: ExecutorContextInterface<AuthParams, unknown>
          ): boolean {
            if (context) {
              this._isAuthenticated = !!context.parameters.token;
            }
            return this._isAuthenticated;
          }

          public isAuthenticated(): boolean {
            return this._isAuthenticated;
          }
        }

        class InheritedAuthPlugin extends BaseAuthPlugin {
          private _userId: number | null = null;

          public override enabled(
            _name: string | symbol,
            context?: ExecutorContextInterface<AuthParams, unknown>
          ): boolean {
            const baseResult = super.enabled(_name, context);
            if (context && baseResult) {
              this._userId = context.parameters.userId;
            }
            return baseResult;
          }

          public getUserId(): number | null {
            return this._userId;
          }
        }

        const inheritedPlugin = new InheritedAuthPlugin();
        const context = new MockExecutorContext<AuthParams, unknown>({
          token: 'valid-token',
          userId: 123
        });

        const result = inheritedPlugin.enabled('test', context);
        expect(result).toBe(true);
        expect(inheritedPlugin.isAuthenticated()).toBe(true);
        expect(inheritedPlugin.getUserId()).toBe(123);
      });

      it('should correctly type plugin with generic type parameters', () => {
        interface BaseParams {
          id: number;
        }

        class GenericPlugin<T extends BaseParams>
          implements ExecutorPluginInterface<ExecutorContextInterface<T, unknown>>
        {
          public readonly pluginName = 'GenericPlugin';
          protected _lastId: number | null = null;

          public enabled(
            _name: string | symbol,
            context?: ExecutorContextInterface<T, unknown>
          ): boolean {
            if (context) {
              this._lastId = context.parameters.id;
            }
            return true;
          }

          public getLastId(): number | null {
            return this._lastId;
          }
        }

        interface UserParams extends BaseParams {
          name: string;
        }

        interface ProductParams extends BaseParams {
          price: number;
        }

        const userPlugin = new GenericPlugin<UserParams>();
        const productPlugin = new GenericPlugin<ProductParams>();

        const userContext = new MockExecutorContext<UserParams, unknown>({
          id: 1,
          name: 'User'
        });

        const productContext = new MockExecutorContext<ProductParams, unknown>({
          id: 2,
          price: 99.99
        });

        userPlugin.enabled('test', userContext);
        productPlugin.enabled('test', productContext);

        expect(userPlugin.getLastId()).toBe(1);
        expect(productPlugin.getLastId()).toBe(2);
      });
    });

    describe('Combined Extended Types', () => {
      it('should correctly type extended context with extended plugin', () => {
        interface ExtendedApiParams {
          endpoint: string;
          method: string;
          headers?: Record<string, string>;
        }

        class ExtendedApiContext<T extends ExtendedApiParams>
          extends MockExecutorContext<T, unknown>
          implements ExecutorContextInterface<T, unknown>
        {
          public getEndpoint(): string {
            return this.parameters.endpoint;
          }

          public getMethod(): string {
            return this.parameters.method;
          }
        }

        class ExtendedApiPlugin
          implements
            ExecutorPluginInterface<
              ExecutorContextInterface<ExtendedApiParams, unknown>
            >
        {
          public readonly pluginName = 'ExtendedApiPlugin';
          public enabled(
            _name: string | symbol,
            context?: ExecutorContextInterface<ExtendedApiParams, unknown>
          ): boolean {
            if (context) {
              const endpoint = context.parameters.endpoint;
              const method = context.parameters.method;
              return endpoint.startsWith('/api') && method.length > 0;
            }
            return false;
          }
        }

        const extendedContext = new ExtendedApiContext<ExtendedApiParams>({
          endpoint: '/api/users',
          method: 'GET',
          headers: { Authorization: 'Bearer token' }
        }) as ExecutorContextInterface<ExtendedApiParams, unknown>;

        const extendedPlugin = new ExtendedApiPlugin();

        expect(
          (extendedContext as ExtendedApiContext<ExtendedApiParams>).getEndpoint()
        ).toBe('/api/users');
        expect(
          (extendedContext as ExtendedApiContext<ExtendedApiParams>).getMethod()
        ).toBe('GET');
        expect(extendedPlugin.enabled('test', extendedContext)).toBe(true);
      });

      it('should correctly type complex inheritance chain', () => {
        interface BaseData {
          timestamp: number;
        }

        interface UserData extends BaseData {
          userId: number;
          username: string;
        }

        interface AdminData extends UserData {
          permissions: string[];
        }

        class BaseDataContext<T extends BaseData>
          extends MockExecutorContext<T, unknown>
          implements ExecutorContextInterface<T, unknown>
        {
          public getTimestamp(): number {
            return this.parameters.timestamp;
          }
        }

        class UserDataContext<T extends UserData>
          extends BaseDataContext<T>
          implements ExecutorContextInterface<T, unknown>
        {
          public getUserInfo(): string {
            return `${this.parameters.username} (${this.parameters.userId})`;
          }
        }

        class AdminDataContext extends UserDataContext<AdminData> {
          public hasPermission(permission: string): boolean {
            return this.parameters.permissions.includes(permission);
          }
        }

        const adminContext = new AdminDataContext({
          timestamp: Date.now(),
          userId: 1,
          username: 'admin',
          permissions: ['read', 'write', 'delete']
        });

        expect(adminContext.getTimestamp()).toBeGreaterThan(0);
        expect(adminContext.getUserInfo()).toBe('admin (1)');
        expect(adminContext.hasPermission('read')).toBe(true);
        expect(adminContext.hasPermission('execute')).toBe(false);
      });

      it('should correctly type plugin with multiple interface implementations', () => {
        interface LogParams {
          level: string;
          message: string;
        }

        class ComprehensivePlugin
          implements
            LifecyclePluginInterface<
              ExecutorContextInterface<LogParams, unknown>
            >
        {
          public readonly pluginName = 'ComprehensivePlugin';
          private _logs: string[] = [];
          private _beforeExecuted = false;
          private _successExecuted = false;

          // enabled is inherited from ExecutorPluginInterface (via LifecyclePluginInterface)
          public enabled(
            _name: string | symbol,
            context?: ExecutorContextInterface<LogParams, unknown>
          ): boolean {
            if (context) {
              this._logs.push(
                `[${context.parameters.level}] ${context.parameters.message}`
              );
            }
            return true;
          }

          // Lifecycle methods from LifecyclePluginInterface
          public onBefore(
            _ctx: ExecutorContextInterface<LogParams, unknown>
          ): void {
            this._beforeExecuted = true;
          }

          public onSuccess(
            _ctx: ExecutorContextInterface<LogParams, unknown>
          ): void {
            this._successExecuted = true;
          }

          public getLogs(): string[] {
            return this._logs;
          }

          public getLifecycleState(): {
            before: boolean;
            success: boolean;
          } {
            return {
              before: this._beforeExecuted,
              success: this._successExecuted
            };
          }
        }

        const comprehensivePlugin = new ComprehensivePlugin();
        const context = new MockExecutorContext<LogParams, unknown>({
          level: 'info',
          message: 'Test message'
        });

        comprehensivePlugin.enabled('test', context);
        comprehensivePlugin.onBefore(context);
        comprehensivePlugin.onSuccess(context);

        expect(comprehensivePlugin.getLogs()).toContain('[info] Test message');
        expect(comprehensivePlugin.getLifecycleState().before).toBe(true);
        expect(comprehensivePlugin.getLifecycleState().success).toBe(true);
      });
    });
  });

  describe('runtimes Method Types', () => {
    it('should correctly type runtimes method with generic context', () => {
      interface UserParams {
        userId: number;
        username: string;
      }

      interface AdminParams extends UserParams {
        role: string;
      }

      class UserPlugin
        implements
          ExecutorPluginInterface<ExecutorContextInterface<UserParams, unknown>>
      {
        public readonly pluginName = 'UserPlugin';

        public enabled(
          _name: string | symbol,
          _context?: ExecutorContextInterface<UserParams, unknown>
        ): boolean {
          return true;
        }
      }

      class AdminPlugin
        implements
          ExecutorPluginInterface<
            ExecutorContextInterface<AdminParams, unknown>
          >
      {
        public readonly pluginName = 'AdminPlugin';

        public enabled(
          _name: string | symbol,
          _context?: ExecutorContextInterface<AdminParams, unknown>
        ): boolean {
          return true;
        }
      }

      const userContext = new MockExecutorContext<UserParams, unknown>({
        userId: 1,
        username: 'user'
      });

      const adminContext = new MockExecutorContext<AdminParams, unknown>({
        userId: 2,
        username: 'admin',
        role: 'administrator'
      });

      const userPlugin = new UserPlugin();
      const adminPlugin = new AdminPlugin();

      // Test runtimes with UserParams context
      userContext.runtimes({
        pluginName: userPlugin.pluginName,
        hookName: 'onBefore',
        pluginIndex: 0,
        times: 1
      });
      expect(userContext.shouldBreakChain()).toBe(false);

      // Test runtimes with AdminParams context
      adminContext.runtimes({
        pluginName: adminPlugin.pluginName,
        hookName: 'onSuccess',
        pluginIndex: 1,
        times: 1
      });
      expect(adminContext.shouldBreakChain()).toBe(false);

      // Verify type safety: should compile without errors
      const runtimesUser: (runtimes: Partial<HookRuntimes>) => void =
        userContext.runtimes.bind(userContext);

      const runtimesAdmin: (runtimes: Partial<HookRuntimes>) => void =
        adminContext.runtimes.bind(adminContext);

      expect(typeof runtimesUser).toBe('function');
      expect(typeof runtimesAdmin).toBe('function');
    });

    it('should correctly type runtimes method with different plugin types', () => {
      interface DataParams {
        value: number;
      }

      class PluginA
        implements
          ExecutorPluginInterface<ExecutorContextInterface<DataParams, unknown>>
      {
        public readonly pluginName = 'PluginA';

        public enabled(
          _name: string | symbol,
          _context?: ExecutorContextInterface<DataParams, unknown>
        ): boolean {
          return true;
        }
      }

      class PluginB
        implements
          ExecutorPluginInterface<ExecutorContextInterface<DataParams, unknown>>
      {
        public readonly pluginName = 'PluginB';
        public readonly onlyOne = true;

        public enabled(
          _name: string | symbol,
          _context?: ExecutorContextInterface<DataParams, unknown>
        ): boolean {
          return true;
        }
      }

      const context = new MockExecutorContext<DataParams, unknown>({
        value: 42
      });
      const pluginA = new PluginA();
      const pluginB = new PluginB();

      // Test runtimes with PluginA
      context.runtimes({
        pluginName: pluginA.pluginName,
        hookName: 'onBefore',
        pluginIndex: 0,
        times: 1
      });
      expect(context.shouldBreakChain()).toBe(false);

      // Test runtimes with PluginB
      context.runtimes({
        pluginName: pluginB.pluginName,
        hookName: 'onExec',
        pluginIndex: 1,
        times: 1
      });
      expect(context.shouldBreakChain()).toBe(false);

      // Verify that runtimes accepts both plugin types
      const runtimesMethod: (runtimes: Partial<HookRuntimes>) => void =
        context.runtimes.bind(context);

      runtimesMethod({
        pluginName: pluginA.pluginName,
        hookName: 'onSuccess',
        pluginIndex: 2,
        times: 1
      });
      runtimesMethod({
        pluginName: pluginB.pluginName,
        hookName: 'onError',
        pluginIndex: 3,
        times: 1
      });

      expect(typeof runtimesMethod).toBe('function');
    });

    it('should correctly type runtimes method with string hook names', () => {
      interface TestParams {
        test: string;
      }

      class TestPlugin
        implements
          ExecutorPluginInterface<ExecutorContextInterface<TestParams, unknown>>
      {
        public readonly pluginName = 'TestPlugin';

        public enabled(
          _name: string | symbol,
          _context?: ExecutorContextInterface<TestParams, unknown>
        ): boolean {
          return true;
        }
      }

      const context = new MockExecutorContext<TestParams, unknown>({
        test: 'value'
      });
      const plugin = new TestPlugin();

      // Test with various hook name strings
      const hookNames: string[] = [
        'onBefore',
        'onExec',
        'onSuccess',
        'onError',
        'customHook'
      ];

      hookNames.forEach((hookName, index) => {
        context.runtimes({
          pluginName: plugin.pluginName,
          hookName,
          pluginIndex: index,
          times: 1
        });
      });

      expect(context.shouldBreakChain()).toBe(false);
    });

    it('should correctly type runtimes method return type as void', () => {
      interface Params {
        data: string;
      }

      class TestPlugin
        implements
          ExecutorPluginInterface<ExecutorContextInterface<Params, unknown>>
      {
        public readonly pluginName = 'TestPlugin';

        public enabled(
          _name: string | symbol,
          _context?: ExecutorContextInterface<Params, unknown>
        ): boolean {
          return true;
        }
      }

      const context = new MockExecutorContext<Params, unknown>({
        data: 'test'
      });
      const plugin = new TestPlugin();

      // Verify return type is void
      const result: void = context.runtimes({
        pluginName: plugin.pluginName,
        hookName: 'onBefore',
        pluginIndex: 0,
        times: 1
      });
      expect(result).toBeUndefined();
    });

    it('should correctly type runtimes method with generic constraints', () => {
      interface BaseParams {
        id: number;
      }

      interface ExtendedParams extends BaseParams {
        name: string;
      }

      class BasePlugin
        implements
          ExecutorPluginInterface<ExecutorContextInterface<BaseParams, unknown>>
      {
        public readonly pluginName = 'BasePlugin';

        public enabled(
          _name: string | symbol,
          _context?: ExecutorContextInterface<BaseParams, unknown>
        ): boolean {
          return true;
        }
      }

      class ExtendedPlugin
        implements
          ExecutorPluginInterface<
            ExecutorContextInterface<ExtendedParams, unknown>
          >
      {
        public readonly pluginName = 'ExtendedPlugin';

        public enabled(
          _name: string | symbol,
          _context?: ExecutorContextInterface<ExtendedParams, unknown>
        ): boolean {
          return true;
        }
      }

      const baseContext = new MockExecutorContext<BaseParams, unknown>({
        id: 1
      });
      const extendedContext = new MockExecutorContext<ExtendedParams, unknown>({
        id: 2,
        name: 'test'
      });

      const basePlugin = new BasePlugin();
      const extendedPlugin = new ExtendedPlugin();

      // Test with base context and plugin
      baseContext.runtimes({
        pluginName: basePlugin.pluginName,
        hookName: 'onBefore',
        pluginIndex: 0,
        times: 1
      });

      // Test with extended context and plugin
      extendedContext.runtimes({
        pluginName: extendedPlugin.pluginName,
        hookName: 'onSuccess',
        pluginIndex: 1,
        times: 1
      });

      // Verify type constraints work correctly
      const runtimesBase: (runtimes: Partial<HookRuntimes>) => void =
        baseContext.runtimes.bind(baseContext);

      const runtimesExtended: (runtimes: Partial<HookRuntimes>) => void =
        extendedContext.runtimes.bind(extendedContext);

      runtimesBase({
        pluginName: basePlugin.pluginName,
        hookName: 'onExec',
        pluginIndex: 2,
        times: 1
      });
      runtimesExtended({
        pluginName: extendedPlugin.pluginName,
        hookName: 'onError',
        pluginIndex: 3,
        times: 1
      });

      expect(typeof runtimesBase).toBe('function');
      expect(typeof runtimesExtended).toBe('function');
    });

    it('should correctly track runtime information through runtimes method', () => {
      interface Params {
        value: number;
      }

      class TrackingPlugin
        implements
          ExecutorPluginInterface<ExecutorContextInterface<Params, unknown>>
      {
        public readonly pluginName = 'TrackingPlugin';

        public enabled(
          _name: string | symbol,
          _context?: ExecutorContextInterface<Params, unknown>
        ): boolean {
          return true;
        }
      }

      const context = new MockExecutorContext<Params, unknown>({ value: 100 });
      const plugin1 = new TrackingPlugin();
      const plugin2 = new TrackingPlugin();

      // Track first plugin execution
      context.runtimes({
        pluginName: plugin1.pluginName,
        hookName: 'onBefore',
        pluginIndex: 0,
        times: 1
      });
      expect(context.shouldBreakChain()).toBe(false);

      // Track second plugin execution
      context.runtimes({
        pluginName: plugin2.pluginName,
        hookName: 'onExec',
        pluginIndex: 1,
        times: 1
      });
      expect(context.shouldBreakChain()).toBe(false);

      // Verify runtimes method signature
      const runtimesSignature: (runtimes: Partial<HookRuntimes>) => void =
        context.runtimes.bind(context);

      expect(typeof runtimesSignature).toBe('function');
    });

    it('should correctly type runtimes method with union plugin types', () => {
      interface Params {
        data: string;
      }

      class PluginA
        implements
          ExecutorPluginInterface<ExecutorContextInterface<Params, unknown>>
      {
        public readonly pluginName = 'PluginA';

        public enabled(
          _name: string | symbol,
          _context?: ExecutorContextInterface<Params, unknown>
        ): boolean {
          return true;
        }
      }

      class PluginB
        implements
          ExecutorPluginInterface<ExecutorContextInterface<Params, unknown>>
      {
        public readonly pluginName = 'PluginB';

        public enabled(
          _name: string | symbol,
          _context?: ExecutorContextInterface<Params, unknown>
        ): boolean {
          return true;
        }
      }

      const context = new MockExecutorContext<Params, unknown>({
        data: 'test'
      });
      const pluginA = new PluginA();
      const pluginB = new PluginB();

      // Test runtimes accepts union of plugin types
      const plugins: ExecutorPluginInterface<
        ExecutorContextInterface<Params, unknown>
      >[] = [pluginA, pluginB];

      plugins.forEach((plugin, index) => {
        context.runtimes({
          pluginName: plugin.pluginName,
          hookName: 'onBefore',
          pluginIndex: index,
          times: 1
        });
      });

      expect(context.shouldBreakChain()).toBe(false);
    });
  });
});
