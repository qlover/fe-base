import {
  AsyncExecutor,
  SyncExecutor,
  ExecutorError,
  ExecutorPlugin
} from '../common';

describe('AsyncExecutor', () => {
  it('should successfully execute an asynchronous task', async () => {
    const executor = new AsyncExecutor();
    const result = await executor.exec(async () => 'success');
    expect(result).toBe('success');
  });

  it('should handle errors in asynchronous tasks', async () => {
    const executor = new AsyncExecutor();
    const error = new Error('test error');

    await expect(
      executor.exec(async () => {
        throw error;
      })
    ).rejects.toBeInstanceOf(ExecutorError);
  });

  it('should modify the execution result through plugins', async () => {
    const executor = new AsyncExecutor();
    const plugin: ExecutorPlugin = {
      onSuccess: (result) => result + ' modified'
    };

    executor.addPlugin(plugin);
    const result = await executor.exec(async () => 'test');
    expect(result).toBe('test modified');
  });

  it('should handle errors through plugins', async () => {
    const executor = new AsyncExecutor();
    const customError = new ExecutorError('custom error', 'CUSTOM_ERROR');

    const plugin: ExecutorPlugin = {
      onError: () => customError
    };

    executor.addPlugin(plugin);

    await expect(
      executor.exec(async () => {
        throw new Error('original error');
      })
    ).rejects.toBe(customError);
  });

  it('execNoError should return ExecutorError instead of throwing an error', async () => {
    const executor = new AsyncExecutor();
    const result = await executor.execNoError(async () => {
      throw new Error('test error');
    });

    expect(result).toBeInstanceOf(ExecutorError);
  });
});

describe('SyncExecutor', () => {
  it('should successfully execute a synchronous task', () => {
    const executor = new SyncExecutor();
    const result = executor.exec(() => 'success');
    expect(result).toBe('success');
  });

  it('should handle errors in synchronous tasks', () => {
    const executor = new SyncExecutor();
    const error = new Error('test error');

    expect(() => {
      executor.exec(() => {
        throw error;
      });
    }).toThrow(ExecutorError);
  });

  it('should modify the execution result through plugins', () => {
    const executor = new SyncExecutor();
    const plugin: ExecutorPlugin = {
      onSuccess: (result) => result + ' modified'
    };

    executor.addPlugin(plugin);
    const result = executor.exec(() => 'test');
    expect(result).toBe('test modified');
  });

  it('should handle errors through plugins', () => {
    const executor = new SyncExecutor();
    const customError = new ExecutorError('custom error', 'CUSTOM_ERROR');

    const plugin: ExecutorPlugin = {
      onError: () => customError
    };

    executor.addPlugin(plugin);

    expect(() => {
      executor.exec(() => {
        throw new Error('original error');
      });
    }).toThrow(customError);
  });

  it('execNoError should return ExecutorError instead of throwing an error', () => {
    const executor = new SyncExecutor();
    const result = executor.execNoError(() => {
      throw new Error('test error');
    });

    expect(result).toBeInstanceOf(ExecutorError);
  });
});

describe('ExecutorPlugin Chain', () => {
  it('should execute multiple plugins in order', async () => {
    const executor = new AsyncExecutor();
    const steps: number[] = [];

    const plugin1: ExecutorPlugin = {
      onSuccess: () => {
        steps.push(1);
      }
    };

    const plugin2: ExecutorPlugin = {
      onSuccess: () => {
        steps.push(2);
      }
    };

    executor.addPlugin(plugin1);
    executor.addPlugin(plugin2);

    await executor.exec(async () => 'test');
    expect(steps).toEqual([1, 2]);
  });

  it('if a plugin returns undefined, the chain should continue', async () => {
    const executor = new AsyncExecutor();
    let finalResult = '';

    const plugin1: ExecutorPlugin = {
      onSuccess: (): any => undefined
    };

    const plugin2: ExecutorPlugin = {
      onSuccess: (result) => {
        finalResult = result + ' modified';
        return finalResult;
      }
    };

    executor.addPlugin(plugin1);
    executor.addPlugin(plugin2);

    const result = await executor.exec(async () => 'test');
    expect(result).toBe('test modified');
  });
});

describe('ExecutorPlugin Error', () => {
  it('should handle error in executor', async () => {
    const executor = new AsyncExecutor();

    await expect(
      executor.exec(async () => {
        throw new Error('Test ExecutorPlugin Error');
      })
    ).rejects.toBeInstanceOf(ExecutorError);
  });

  it('should handle plugin error', async () => {
    const executor = new AsyncExecutor();

    const plugin: ExecutorPlugin = {
      onError: (error) => new ExecutorError(error.message, 'PLUGIN_ERROR')
    };

    executor.addPlugin(plugin);

    const promise = executor.exec(async () => {
      throw new Error('Test ExecutorPlugin Error');
    });

    await expect(promise).rejects.toBeInstanceOf(ExecutorError);
    await expect(promise).rejects.toHaveProperty('code', 'PLUGIN_ERROR');
    await expect(promise).rejects.toHaveProperty(
      'message',
      'Test ExecutorPlugin Error'
    );
  });
});

describe('ExecutorPlugin no throw error', () => {
  it('should handle no error in executor', async () => {
    const executor = new AsyncExecutor();
    const promise = executor.execNoError(async () => {
      throw new Error('Test ExecutorPlugin No Error');
    });
    await expect(promise).resolves.toBeInstanceOf(ExecutorError);
  });
});
