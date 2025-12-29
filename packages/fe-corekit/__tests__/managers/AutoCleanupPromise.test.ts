import { AutoCleanupPromise } from '../../src/pools/AutoCleanupPromise';

describe('AutoCleanupPromise', () => {
  it('should provide a callable finalizer with add/addCleanup aliases (types)', () => {
    AutoCleanupPromise.run((finalizer) => {
      expectTypeOf(finalizer).toBeFunction();
      expectTypeOf(finalizer.add).toBeFunction();
      expectTypeOf(finalizer.addCleanup).toBeFunction();
      return Promise.resolve();
    });
  });

  it('should run cleanups in LIFO order (resolve)', async () => {
    const calls: string[] = [];

    const result = await AutoCleanupPromise.run((finalizer) => {
      finalizer(() => calls.push('1'));
      finalizer(() => calls.push('2'));
      return Promise.resolve('ok');
    });

    expect(result).toBe('ok');
    expect(calls).toEqual(['2', '1']);
  });

  it('should support mixing callable/add/addCleanup registrations (LIFO)', async () => {
    const calls: string[] = [];

    await AutoCleanupPromise.run((finalizer) => {
      finalizer(() => calls.push('call-1'));
      finalizer.add(() => calls.push('add-2'));
      finalizer.addCleanup(() => calls.push('addCleanup-3'));
      return Promise.resolve();
    });

    expect(calls).toEqual(['addCleanup-3', 'add-2', 'call-1']);
  });

  it('should run cleanups in LIFO order (reject)', async () => {
    const calls: string[] = [];
    const err = new Error('boom');

    await expect(
      AutoCleanupPromise.run((finalizer) => {
        finalizer(() => calls.push('1'));
        finalizer(() => calls.push('2'));
        return Promise.reject(err);
      })
    ).rejects.toBe(err);

    expect(calls).toEqual(['2', '1']);
  });

  it('should support sync return values', async () => {
    const cleanup = vi.fn();

    const result = await AutoCleanupPromise.run((finalizer) => {
      finalizer(cleanup);
      return 123;
    });

    expect(result).toBe(123);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('should run cleanup at most once', async () => {
    const cleanup = vi.fn();

    const p = AutoCleanupPromise.run((finalizer) => {
      finalizer(cleanup);
      return Promise.resolve('ok');
    });

    // Add extra finally handlers; cleanup should still run only once.
    await p.finally(() => undefined).finally(() => undefined);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('should ignore non-function cleanup registration at runtime', async () => {
    const cleanup = vi.fn();

    await AutoCleanupPromise.run((finalizer) => {
      (finalizer as any)(null);
      (finalizer as any).add(undefined);
      (finalizer as any).addCleanup('nope');
      finalizer(cleanup);
      return Promise.resolve();
    });

    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('should swallow cleanup errors and keep the original promise outcome', async () => {
    const cleanupOk = vi.fn();

    const result = await AutoCleanupPromise.run((finalizer) => {
      finalizer(() => {
        throw new Error('cleanup failed');
      });
      finalizer(cleanupOk);
      return Promise.resolve('ok');
    });

    expect(result).toBe('ok');
    expect(cleanupOk).toHaveBeenCalledTimes(1);
  });

  it('should swallow cleanup errors and keep the original rejection reason', async () => {
    const cleanupOk = vi.fn();
    const err = new Error('main error');

    await expect(
      AutoCleanupPromise.run((finalizer) => {
        finalizer(() => {
          throw new Error('cleanup failed');
        });
        finalizer(cleanupOk);
        return Promise.reject(err);
      })
    ).rejects.toBe(err);

    expect(cleanupOk).toHaveBeenCalledTimes(1);
  });

  it('should run cleanup even if factory throws synchronously', async () => {
    const cleanup = vi.fn();
    const err = new Error('sync boom');

    await expect(
      AutoCleanupPromise.run((finalizer) => {
        finalizer(cleanup);
        throw err;
      })
    ).rejects.toBe(err);

    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('should run cleanup when Promise.resolve(thenable) rejects due to throwing then getter', async () => {
    const cleanup = vi.fn();
    const err = new Error('then getter boom');
    const thenable = {
      get then() {
        throw err;
      }
    } as unknown as PromiseLike<void>;

    await expect(
      AutoCleanupPromise.run((finalizer) => {
        finalizer(cleanup);
        return thenable;
      })
    ).rejects.toBe(err);

    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('should support Promise-constructor style executor', async () => {
    const cleanup = vi.fn();

    const result = await AutoCleanupPromise.fromExecutor<string>(
      (resolve, _reject, finalizer) => {
        finalizer(cleanup);
        resolve('done');
      }
    );

    expect(result).toBe('done');
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('should run cleanup when executor throws synchronously', async () => {
    const cleanup = vi.fn();
    const err = new Error('executor boom');

    await expect(
      AutoCleanupPromise.fromExecutor<void>((_resolve, _reject, finalizer) => {
        finalizer(cleanup);
        throw err;
      })
    ).rejects.toBe(err);

    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('should execute cleanup only once even if executor resolves then rejects', async () => {
    const cleanup = vi.fn();

    const result = await AutoCleanupPromise.fromExecutor<string>(
      (resolve, reject, finalizer) => {
        finalizer(cleanup);
        resolve('done');
        reject(new Error('later error'));
      }
    );

    expect(result).toBe('done');
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('should allow cleanup to register more cleanup (re-entrancy safe)', async () => {
    const calls: string[] = [];

    await AutoCleanupPromise.run((finalizer) => {
      finalizer(() => calls.push('A'));
      finalizer(() => {
        calls.push('B');
        // Added during cleanup; should execute immediately (since cleanup is running)
        finalizer(() => calls.push('C'));
      });
      return Promise.resolve();
    });

    // LIFO: B runs first, then it registers C which runs immediately, then A runs.
    expect(calls).toEqual(['B', 'C', 'A']);
  });

  it('should execute cleanup immediately if added after settled', async () => {
    let capturedFinalizer: any;

    await AutoCleanupPromise.fromExecutor<void>((resolve, _reject, finalizer) => {
      capturedFinalizer = finalizer;
      resolve();
    });

    const lateCleanup = vi.fn();
    capturedFinalizer(lateCleanup);

    expect(lateCleanup).toHaveBeenCalledTimes(1);
  });

  it('should execute multiple late cleanups immediately (after settled)', async () => {
    let capturedFinalizer: any;

    await AutoCleanupPromise.run((finalizer) => {
      capturedFinalizer = finalizer;
      return Promise.resolve();
    });

    const c1 = vi.fn();
    const c2 = vi.fn();

    capturedFinalizer(c1);
    capturedFinalizer.addCleanup(c2);

    expect(c1).toHaveBeenCalledTimes(1);
    expect(c2).toHaveBeenCalledTimes(1);
  });

  it('should handle large number of cleanups without losing any (stress)', async () => {
    const count = 20000;
    let sum = 0;

    await AutoCleanupPromise.run((finalizer) => {
      for (let i = 0; i < count; i++) {
        finalizer(() => {
          sum++;
        });
      }
      return Promise.resolve();
    });

    expect(sum).toBe(count);
  });
});


