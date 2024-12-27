import {
  ExecutorError,
  ExecutorPlugin,
  ExecutorContext
} from '../../../../interface';
import { SyncExecutor } from '../../..';

function mockLogStdIo(): {
  spy: jest.SpyInstance;
  lastStdout: () => string;
  stdouts: () => string;
  end: () => void;
} {
  const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});

  const end = (): void => {
    spy.mockRestore();
  };

  const lastStdout = (): string => {
    if (spy.mock.calls.length === 0) {
      return '';
    }
    return spy.mock.calls[spy.mock.calls.length - 1].join('');
  };

  const allStdout = (): string => {
    return spy.mock.calls.map((call) => call.join('')).join('');
  };

  return { spy, end, lastStdout, stdouts: allStdout };
}

describe('Executor Sync implmentation', () => {
  it('should successfully run exec method', () => {
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
    }).toThrow(error);
  });

  it('should return ExecutorError in execNoError method', () => {
    const executor = new SyncExecutor();
    const task = (): unknown => {
      throw new Error('Task failed');
    };
    const result = executor.execNoError(task);
    expect(result).toBeInstanceOf(ExecutorError);
    expect((result as ExecutorError).message).toBe('Task failed');
  });

  it('should run hooks correctly', () => {
    const executor = new SyncExecutor();
    const plugin: ExecutorPlugin = {
      pluginName: 'test',
      onBefore: jest.fn(),
      onSuccess: jest.fn(),
      onError: jest.fn()
    };
    executor.use(plugin);
    executor.runHooks([plugin], 'onBefore');
    expect(plugin.onBefore).toHaveBeenCalled();
  });

  it('should not call hooks if plugin is disabled', () => {
    const executor = new SyncExecutor();
    const plugin: ExecutorPlugin = {
      pluginName: 'test',
      enabled: () => false,
      onBefore: jest.fn(),
      onSuccess: jest.fn(),
      onError: jest.fn()
    };
    executor.use(plugin);
    executor.runHooks([plugin], 'onBefore');
    expect(plugin.onBefore).not.toHaveBeenCalled();
  });

  it('should handle execNoError without plugins', () => {
    const executor = new SyncExecutor();
    const task = (): unknown => {
      throw new Error('No plugins error');
    };
    const result = executor.execNoError(task);
    expect(result).toBeInstanceOf(ExecutorError);
    expect((result as ExecutorError).message).toBe('No plugins error');
  });
});

describe('SyncExecutor plugin test', () => {
  it('should execute task without plugins', () => {
    const executor = new SyncExecutor();
    const result = executor.exec(() => 'no plugins');
    expect(result).toBe('no plugins');
  });

  it('should add and use multiple plugins', () => {
    const executor = new SyncExecutor();
    const anotherPlugin = {
      pluginName: 'anotherPlugin',
      onBefore: jest.fn(),
      onSuccess: jest.fn(),
      onError: jest.fn(),
      enabled: jest.fn().mockReturnValue(true)
    };
    const mockPlugin = {
      pluginName: 'mockPlugin',
      onBefore: jest.fn(),
      onSuccess: jest.fn(),
      onError: jest.fn(),
      enabled: jest.fn().mockReturnValue(true)
    };

    executor.use(anotherPlugin);
    executor.exec(() => 'test');
    expect(mockPlugin.onBefore).not.toHaveBeenCalled();
    expect(anotherPlugin.onBefore).toHaveBeenCalled();
    expect(mockPlugin.onSuccess).not.toHaveBeenCalled();
    expect(anotherPlugin.onSuccess).toHaveBeenCalled();
  });

  it('should warn plugin already used, set onlyOne to true', () => {
    const { lastStdout, end } = mockLogStdIo();

    const executor = new SyncExecutor();
    const anotherPlugin = {
      pluginName: 'anotherPlugin',
      onlyOne: true,
      onBefore: jest.fn()
    };
    executor.use(anotherPlugin);
    // repeat use, and only one plugin
    executor.use(anotherPlugin);

    expect(lastStdout()).toBe(
      `Plugin ${anotherPlugin.pluginName} is already used, skip adding`
    );

    end();
  });

  it('should skip lifecycle name not correct', () => {
    const executor = new SyncExecutor();
    const anotherPlugin = {
      pluginName: 'anotherPlugin',
      onBefore2: jest.fn()
    };
    executor.use(anotherPlugin);
    executor.runHooks([anotherPlugin], 'onBefore');
    expect(anotherPlugin.onBefore2).not.toHaveBeenCalled();
  });

  it('should can custom lifecycle method name', () => {
    const executor = new SyncExecutor();
    const anotherPlugin = {
      pluginName: 'anotherPlugin',
      onBefore2: jest.fn()
    };
    executor.use(anotherPlugin);
    executor.runHooks([anotherPlugin], 'onBefore2');
    expect(anotherPlugin.onBefore2).toHaveBeenCalled();
  });
});

describe('SyncExecutor onBefore Lifecycle', () => {
  it('should not support return value onBefore chain', () => {
    const executor = new SyncExecutor();
    executor.use({
      pluginName: 'test1',
      // not support return
      onBefore({ returnValue }) {
        return (returnValue + '123') as unknown as void;
      }
    });

    executor.use({
      pluginName: 'test2',
      onBefore({ returnValue }) {
        expect(returnValue).not.toBeDefined();
      }
    });

    const result = executor.exec(() => 'test');
    expect(result).not.toBe('test123');
    expect(result).toBe('test');
  });

  it('should modify input data through onBefore hooks', () => {
    const executor = new SyncExecutor();
    const plugin1: ExecutorPlugin<Record<string, unknown>> = {
      pluginName: 'test',
      onBefore: ({ parameters }) => {
        parameters.modifiedBy = 'plugin1';
      }
    };
    const plugin2: ExecutorPlugin<Record<string, unknown>> = {
      pluginName: 'test2',
      onBefore: ({ parameters }) => {
        parameters.modifiedBy = 'plugin2';
      }
    };

    executor.use(plugin1);
    executor.use(plugin2);

    const result = executor.exec(
      { value: 'test' },
      ({ parameters }: ExecutorContext<Record<string, unknown>>) =>
        parameters.modifiedBy
    );
    expect(result).toBe('plugin2');
  });

  it("should use the first plugin's onBefore return value if no subsequent plugin returns a value", () => {
    const executor = new SyncExecutor();
    const plugin1: ExecutorPlugin<Record<string, unknown>> = {
      pluginName: 'test',
      onBefore: ({ parameters }) => {
        parameters.modifiedBy = 'plugin1';
      }
    };
    const plugin2: ExecutorPlugin<Record<string, unknown>> = {
      pluginName: 'test2',
      onBefore: jest.fn()
    };

    executor.use(plugin1);
    executor.use(plugin2);

    const result = executor.exec(
      { value: 'test' },
      ({ parameters }: ExecutorContext<Record<string, unknown>>) =>
        parameters.modifiedBy
    );
    expect(result).toBe('plugin1');
  });

  it('should stop onBefore chain and enter onError if an error is thrown', () => {
    const executor = new SyncExecutor();
    const plugin1: ExecutorPlugin = {
      pluginName: 'test',
      onBefore: () => {
        throw new Error('Error in onBefore');
      }
    };
    const plugin2: ExecutorPlugin = {
      pluginName: 'test2',
      onBefore: jest.fn()
    };
    const onError = jest.fn();

    executor.use(plugin1);
    executor.use(plugin2);
    executor.use({ pluginName: 'test3', onError });

    expect(() => {
      executor.exec({ value: 'test' }, (data) => data);
    }).toThrow(ExecutorError);

    expect(plugin2.onBefore).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
  });

  it('should execute onError if onBefore throws an error', () => {
    const executor = new SyncExecutor();
    const plugin1: ExecutorPlugin = {
      pluginName: 'test',
      onBefore: () => {
        throw new Error('Error in onBefore');
      }
    };
    const onError = jest.fn();

    executor.use(plugin1);
    executor.use({ pluginName: 'test2', onError });

    expect(() => {
      executor.exec({ value: 'test' }, (data) => data);
    }).toThrow(ExecutorError);

    expect(onError).toHaveBeenCalled();
  });

  it('should not modify input data if no onBefore hooks are present', () => {
    const executor = new SyncExecutor();
    const result = executor.exec(
      { value: 'test' },
      ({ parameters }) => parameters.value
    );
    expect(result).toBe('test');
  });
});

describe('SyncExecutor onExec Lifecycle', () => {
  it('should modify the task through onExec hook', () => {
    const executor = new SyncExecutor();
    const plugin: ExecutorPlugin<Record<string, unknown>> = {
      pluginName: 'test',
      onExec<T>(): T {
        return 'modified task' as T;
      }
    };

    executor.use(plugin);

    const result = executor.exec(() => 'original task');
    expect(result).toBe('modified task');
  });

  it('should overried task return value when exec hook', () => {
    const executor = new SyncExecutor();
    executor.use({
      pluginName: 'test',
      onExec() {
        return 'task1';
      }
    });

    const result = executor.exec(() => 'original task');
    expect(result).not.toBe('original task');
    expect(result).toBe('task1');
  });

  it('should support chain return value, onexec hook', () => {
    const executor = new SyncExecutor();
    executor.use({
      pluginName: 'test',
      onExec() {
        return 'task1';
      }
    });
    executor.use({
      pluginName: 'test2',
      onExec({ hooksRuntimes }) {
        return hooksRuntimes.returnValue + 'task2';
      }
    });
    const result = executor.exec(() => 'original task');
    expect(result).not.toBe('original tasktask1task2');
    expect(result).toBe('task1task2');
  });

  it("should only use the first plugin's onExec hook", () => {
    const executor = new SyncExecutor();
    const plugin1: ExecutorPlugin = {
      pluginName: 'test',
      onExec() {
        return 'modified by plugin1';
      }
    };
    const plugin2: ExecutorPlugin = {
      enabled: () => false,
      pluginName: 'test2',
      onExec() {
        return 'modified by plugin2';
      }
    };

    executor.use(plugin1);
    executor.use(plugin2);

    const result = executor.exec(() => 'original task');
    expect(result).toBe('modified by plugin1');
  });

  it('should execute the original task if no onExec hooks are present', () => {
    const executor = new SyncExecutor();
    const result = executor.exec(() => 'original task');
    expect(result).toBe('original task');
  });

  it('should stop execution and enter onError if onExec throws an error', () => {
    const executor = new SyncExecutor();
    const onError = jest.fn();
    const onSuccess = jest.fn();

    executor.use({
      pluginName: 'test',
      onExec: () => {
        throw new Error('Error in onExec');
      }
    });
    executor.use({ pluginName: 'test2', onError, onSuccess });

    try {
      executor.exec(() => 'original task');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Error in onExec');
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledTimes(0);
    }
  });
});

describe('SyncExecutor onError Lifecycle', () => {
  it('should handle error in onBefore hook', () => {
    const executor = new SyncExecutor();
    const plugin: ExecutorPlugin = {
      pluginName: 'test',
      onBefore: () => {
        throw new Error('Error in onBefore');
      }
    };

    executor.use(plugin);

    expect(() => {
      executor.exec(() => 'test');
    }).toThrow(ExecutorError);
  });

  it('should handle error in onSuccess hook', () => {
    const executor = new SyncExecutor();
    const plugin: ExecutorPlugin = {
      pluginName: 'test',
      onSuccess: () => {
        throw new Error('Error in onSuccess');
      }
    };

    executor.use(plugin);

    expect(() => {
      executor.exec(() => 'test');
    }).toThrow(ExecutorError);
  });

  it('should handle error in onError hook', () => {
    const executor = new SyncExecutor();
    const plugin: ExecutorPlugin = {
      pluginName: 'test',
      onError: (): ExecutorError => {
        return new ExecutorError('Error in onError');
      }
    };

    executor.use(plugin);

    expect(() => {
      executor.exec(() => {
        throw new Error('original error');
      });
    }).toThrow(ExecutorError);
  });

  it('should continue execution if onBefore hook does not throw', () => {
    const executor = new SyncExecutor();
    const plugin: ExecutorPlugin = {
      pluginName: 'test',
      onBefore: (context: ExecutorContext<Record<string, unknown>>) => {
        if (context.parameters.shouldThrow) {
          throw new Error('Error in onBefore');
        }
      }
    };

    executor.use(plugin);

    const result = executor.exec({ shouldThrow: false }, (data) => 'success');
    expect(result).toBe('success');
  });

  it('should wrap error in ExecutorError if onError hook throws', () => {
    const executor = new SyncExecutor();
    const plugin: ExecutorPlugin = {
      pluginName: 'test',
      onError: (): Error => {
        return new Error('Error in onError');
      }
    };

    executor.use(plugin);

    expect(() => {
      executor.exec(() => {
        throw new Error('original error');
      });
    }).toThrow(ExecutorError);
  });

  it('should throw an error if an error occurred in onError', () => {
    const executor = new SyncExecutor();
    const plugin: ExecutorPlugin = {
      pluginName: 'test',
      onError: () => {
        throw new Error('Error in onError');
      }
    };

    executor.use(plugin);

    try {
      executor.exec(() => {
        throw new Error('original error');
      });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Error in onError');
    }
  });
  it('should handle errors through onError hooks', () => {
    const executor = new SyncExecutor();
    const plugin1: ExecutorPlugin = {
      pluginName: 'test',
      onError: ({ error }) => new ExecutorError('Handled by plugin1', error)
    };
    const plugin2: ExecutorPlugin = {
      pluginName: 'test2',
      onError: ({ error }) => new ExecutorError('Handled by plugin2', error)
    };

    executor.use(plugin1);
    executor.use(plugin2);

    expect(() => {
      executor.exec(() => {
        throw new Error('original error');
      });
    }).toThrow(ExecutorError);
  });

  it('should stop onError chain if an error is thrown', () => {
    const executor = new SyncExecutor();
    const plugin1: ExecutorPlugin = {
      pluginName: 'test',
      onError: () => {
        throw new Error('Error in onError');
      }
    };
    const plugin2: ExecutorPlugin = {
      pluginName: 'test2',
      onError: jest.fn()
    };

    executor.use(plugin1);
    executor.use(plugin2);

    expect(() => {
      executor.exec(() => {
        throw new Error('original error');
      });
    }).toThrow(Error);

    expect(plugin2.onError).not.toHaveBeenCalled();
  });

  it('should wrap raw errors with ExecutorError if no onError returns or throws', () => {
    const executor = new SyncExecutor();
    const plugin1: ExecutorPlugin = {
      pluginName: 'test',
      onError: jest.fn()
    };
    const plugin2: ExecutorPlugin = {
      pluginName: 'test2',
      onError: jest.fn()
    };

    executor.use(plugin1);
    executor.use(plugin2);

    expect(() => {
      executor.exec(() => {
        throw new Error('original error');
      });
    }).toThrow(ExecutorError);
  });

  it('should return the first error encountered in execNoError', () => {
    const executor = new SyncExecutor();
    const plugin1: ExecutorPlugin = {
      pluginName: 'test',
      onError: ({ error }) => new ExecutorError('Handled by plugin1', error)
    };
    const plugin2: ExecutorPlugin = {
      pluginName: 'test2',
      onError: jest.fn()
    };

    executor.use(plugin1);
    executor.use(plugin2);

    try {
      executor.exec(() => {
        throw new Error('original error');
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ExecutorError);
      expect((error as ExecutorError).message).toBe('original error');
      expect(plugin2.onError).toHaveBeenCalledTimes(0);
    }
  });
});

describe('SyncExecutor onSuccess Lifecycle', () => {
  it('should execute onSuccess hook', () => {
    const executor = new SyncExecutor();
    const plugin: ExecutorPlugin = {
      pluginName: 'test2',
      onSuccess: (context) => {
        context.returnValue = context.returnValue + ' success';
      }
    };

    executor.use(plugin);
    const result = executor.exec(() => 'test');
    expect(result).toBe('test success');
  });

  it('should modify the result through onSuccess hooks', () => {
    const executor = new SyncExecutor();
    const plugin1: ExecutorPlugin = {
      pluginName: 'test',
      onSuccess: (context) => {
        context.returnValue = context.returnValue + ' modified by plugin1';
      }
    };
    const plugin2: ExecutorPlugin = {
      pluginName: 'test2',
      onSuccess: (context) => {
        context.returnValue = context.returnValue + ' modified by plugin2';
      }
    };

    executor.use(plugin1);
    executor.use(plugin2);

    const result = executor.exec(() => 'test');
    expect(result).toBe('test modified by plugin1 modified by plugin2');
  });

  it('should stop onSuccess chain and enter onError if an error is thrown', () => {
    const executor = new SyncExecutor();
    const plugin1: ExecutorPlugin = {
      pluginName: 'test',
      onSuccess: () => {
        throw new Error('Error in onSuccess');
      }
    };
    const plugin2: ExecutorPlugin = {
      pluginName: 'test2',
      onSuccess: jest.fn()
    };
    const onError = jest.fn();

    executor.use(plugin1);
    executor.use(plugin2);
    executor.use({ pluginName: 'test3', onError });

    expect(() => {
      executor.exec(() => 'test');
    }).toThrow(ExecutorError);

    expect(plugin2.onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
  });

  it('should not execute onSuccess hook if task throws an error', () => {
    const executor = new SyncExecutor();
    const onSuccess = jest.fn();

    const plugin: ExecutorPlugin = {
      pluginName: 'test',
      onSuccess
    };

    executor.use(plugin);

    expect(() => {
      executor.exec(() => {
        throw new Error('test error');
      });
    }).toThrow(ExecutorError);

    expect(onSuccess).not.toHaveBeenCalled();
  });
});

describe('SyncExecutor execNoError Method', () => {
  it('should return ExecutorError instead of throwing an error', () => {
    const executor = new SyncExecutor();
    const result = executor.execNoError(() => {
      throw new Error('test error');
    });

    expect(result).toBeInstanceOf(ExecutorError);
  });

  it('should execute task and return result if no error occurs', () => {
    const executor = new SyncExecutor();
    const result = executor.execNoError(() => 'success');

    expect(result).toBe('success');
  });

  it('should handle errors through onError hooks and return the first error', () => {
    const executor = new SyncExecutor();
    const plugin1: ExecutorPlugin = {
      pluginName: 'test',
      onError: ({ error }) => new ExecutorError('Handled by plugin1', error)
    };
    const plugin2: ExecutorPlugin = {
      pluginName: 'test2',
      onError: jest.fn()
    };

    executor.use(plugin1);
    executor.use(plugin2);

    const result = executor.execNoError(() => {
      throw new Error('original error');
    });

    expect(result).toBeInstanceOf(ExecutorError);
    expect((result as ExecutorError).message).toBe('original error');
  });

  it('should return the original error wrapped in ExecutorError if no onError hooks are present', () => {
    const executor = new SyncExecutor();
    const result = executor.execNoError(() => {
      throw new Error('original error');
    });

    expect(result).toBeInstanceOf(ExecutorError);
    expect((result as ExecutorError).message).toBe('original error');
  });

  it('should not execute onSuccess hooks if an error occurs', () => {
    const executor = new SyncExecutor();
    const onSuccess = jest.fn();

    const plugin: ExecutorPlugin = {
      pluginName: 'test',
      onSuccess
    };

    executor.use(plugin);

    const result = executor.execNoError(() => {
      throw new Error('test error');
    });

    expect(result).toBeInstanceOf(ExecutorError);
    expect(onSuccess).not.toHaveBeenCalled();
  });
});

describe('SyncExecutor Additional Tests', () => {
  it('should execute multiple plugins in sequence', () => {
    const executor = new SyncExecutor();
    const results: string[] = [];

    const plugin1: ExecutorPlugin = {
      pluginName: 'plugin1',
      onBefore: () => {
        results.push('before1');
      },
      onSuccess: () => {
        results.push('success1');
      },
      onError: () => {
        results.push('error1');
      }
    };

    const plugin2: ExecutorPlugin = {
      pluginName: 'plugin2',
      onBefore: () => {
        results.push('before2');
      },
      onSuccess: () => {
        results.push('success2');
      },
      onError: () => {
        results.push('error2');
      }
    };

    executor.use(plugin1);
    executor.use(plugin2);

    executor.exec(() => 'test');

    expect(results).toEqual(['before1', 'before2', 'success1', 'success2']);
  });

  it('should handle plugin that modifies data in onBefore hook', () => {
    const executor = new SyncExecutor();
    const plugin: ExecutorPlugin<Record<string, unknown>> = {
      pluginName: 'plugin1',
      onBefore: (context) => {
        context.parameters.added = true;
      }
    };

    executor.use(plugin);

    const result = executor.exec<boolean, Record<string, unknown>>(
      { value: 'test' },
      (context) => context.parameters.added as boolean
    );
    expect(result).toBe(true);
  });

  it('should handle plugin that modifies result in onSuccess hook', () => {
    const executor = new SyncExecutor();
    const plugin: ExecutorPlugin<string> = {
      pluginName: 'plugin1',
      onSuccess: (context) => {
        context.returnValue = context.returnValue + ' modified';
      }
    };

    executor.use(plugin);

    const result = executor.exec(() => 'test');
    expect(result).toBe('test modified');
  });

  it('should handle plugin that suppresses error in onError hook', () => {
    const executor = new SyncExecutor();
    const plugin: ExecutorPlugin = {
      pluginName: 'plugin1',
      onError: () => {
        return new ExecutorError('Handled Error');
      }
    };

    executor.use(plugin);

    const result = executor.execNoError(() => {
      throw new Error('test error');
    });

    expect(result).toBeInstanceOf(ExecutorError);
    expect((result as ExecutorError).message).toBe('Handled Error');
  });

  it('should execute task with no plugins', () => {
    const executor = new SyncExecutor();
    const result = executor.exec(() => 'no plugins');
    expect(result).toBe('no plugins');
  });

  it('should throw error if task is not a function', () => {
    const executor = new SyncExecutor();
    try {
      executor.exec('not a function' as unknown as () => unknown);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Task must be a function!');
    }
  });
});
