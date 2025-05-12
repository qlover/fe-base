import { describe, it, expect, vi, MockInstance, beforeEach } from 'vitest';
import {
  Executor,
  ExecutorError,
  ExecutorPlugin
} from '../../../src/interface';

function mockLogStdIo(): {
  spy: MockInstance;
  lastStdout: () => string;
  stdouts: () => string;
  end: () => void;
} {
  const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

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

class MyExecutor extends Executor {
  constructor() {
    super();
  }

  getPlugins(): ExecutorPlugin[] {
    return this.plugins;
  }

  runHooks(plugins: ExecutorPlugin[], hookName: string): void {
    const context = {
      parameters: undefined,
      hooksRuntimes: {}
    };
    for (const plugin of plugins) {
      if (plugin.enabled?.(hookName as keyof ExecutorPlugin) !== false) {
        // @ts-expect-error
        plugin[hookName]?.(context);
      }
    }
  }

  exec(task: () => unknown): unknown {
    try {
      this.runHooks(this.plugins, 'onBefore');
      const result = task();
      this.runHooks(this.plugins, 'onSuccess');
      return result;
    } catch (error) {
      this.runHooks(this.plugins, 'onError');
      throw error;
    }
  }

  execNoError(task: () => unknown): unknown {
    try {
      return this.exec(task);
    } catch (error) {
      return new ExecutorError('EXEC_ERROR', (error as Error)?.message);
    }
  }
}

describe('Defined a simple executor implement, reference SyncExecutor', () => {
  let myExecutor: MyExecutor;
  let mockPlugin: ExecutorPlugin;

  beforeEach(() => {
    myExecutor = new MyExecutor();
    mockPlugin = {
      pluginName: 'mockPlugin',
      onBefore: vi.fn(),
      onSuccess: vi.fn(),
      onError: vi.fn(),
      enabled: vi.fn().mockReturnValue(true)
    };
    myExecutor.use(mockPlugin);
  });

  it('should successfully run exec method', () => {
    const result = myExecutor.exec(() => 'success');
    expect(result).toBe('success');
    expect(mockPlugin.onBefore).toHaveBeenCalled();
    expect(mockPlugin.onSuccess).toHaveBeenCalled();
  });

  it('should handle errors in exec method', () => {
    const task = (): void => {
      throw new Error('Task failed');
    };
    expect(() => myExecutor.exec(task)).toThrow('Task failed');
    expect(mockPlugin.onError).toHaveBeenCalled();
  });

  it('should return ExecutorError in execNoError method', () => {
    const task = (): void => {
      throw new Error('Task failed');
    };
    const result = myExecutor.execNoError(task);
    expect(result).toBeInstanceOf(ExecutorError);
    expect((result as ExecutorError).message).toBe('Task failed');
    expect(mockPlugin.onError).toHaveBeenCalled();
  });

  it('should run hooks correctly', () => {
    myExecutor.runHooks([mockPlugin], 'onBefore');
    expect(mockPlugin.onBefore).toHaveBeenCalled();
  });

  it('should not call hooks if plugin is disabled', () => {
    mockPlugin.enabled = vi.fn().mockReturnValue(false);
    myExecutor.runHooks([mockPlugin], 'onBefore');
    expect(mockPlugin.onBefore).not.toHaveBeenCalled();
  });

  it('should handle execNoError without plugins', () => {
    const myExecutor = new MyExecutor(); // Reset without plugins
    const task = (): void => {
      throw new Error('No plugins error');
    };
    const result = myExecutor.execNoError(task);
    expect(result).toBeInstanceOf(ExecutorError);
    expect((result as ExecutorError).message).toBe('No plugins error');
  });
});

describe('Plugin method test', () => {
  it('should execute task without plugins', () => {
    const myExecutor = new MyExecutor(); // Reset without plugins
    const result = myExecutor.exec(() => 'no plugins');
    expect(result).toBe('no plugins');
  });

  it('should add and use multiple plugins', () => {
    const myExecutor = new MyExecutor();
    const anotherPlugin = {
      pluginName: 'anotherPlugin',
      onBefore: vi.fn(),
      onSuccess: vi.fn(),
      onError: vi.fn(),
      enabled: vi.fn().mockReturnValue(true)
    };
    const mockPlugin = {
      pluginName: 'mockPlugin',
      onBefore: vi.fn(),
      onSuccess: vi.fn(),
      onError: vi.fn(),
      enabled: vi.fn().mockReturnValue(true)
    };

    myExecutor.use(anotherPlugin);
    myExecutor.exec(() => 'test');
    expect(mockPlugin.onBefore).not.toHaveBeenCalled();
    expect(anotherPlugin.onBefore).toHaveBeenCalled();
    expect(mockPlugin.onSuccess).not.toHaveBeenCalled();
    expect(anotherPlugin.onSuccess).toHaveBeenCalled();
  });

  it('should get plugins', () => {
    const myExecutor = new MyExecutor();
    const plugins = myExecutor.getPlugins();
    expect(plugins.length).toBe(0);
  });

  it('should warn plugin already used, set onlyOne to true', () => {
    const { lastStdout, end } = mockLogStdIo();

    const myExecutor = new MyExecutor();
    const anotherPlugin = {
      pluginName: 'anotherPlugin',
      onlyOne: true,
      onBefore: vi.fn()
    };
    myExecutor.use(anotherPlugin);
    // repeat use, and only one plugin
    myExecutor.use(anotherPlugin);

    expect(lastStdout()).toBe(
      `Plugin ${anotherPlugin.pluginName} is already used, skip adding`
    );
    expect(myExecutor.getPlugins().length).toBe(1);

    end();
  });

  it('should skip lifecycle name not correct', () => {
    const myExecutor = new MyExecutor();
    const anotherPlugin = {
      pluginName: 'anotherPlugin',
      onBefore2: vi.fn()
    };
    myExecutor.use(anotherPlugin);
    myExecutor.runHooks([anotherPlugin], 'onBefore');
    expect(anotherPlugin.onBefore2).not.toHaveBeenCalled();
  });

  it('should can custom lifecycle method name', () => {
    const myExecutor = new MyExecutor();
    const anotherPlugin = {
      pluginName: 'anotherPlugin',
      onBefore2: vi.fn()
    };
    myExecutor.use(anotherPlugin);
    myExecutor.runHooks([anotherPlugin], 'onBefore2');
    expect(anotherPlugin.onBefore2).toHaveBeenCalled();
  });
});
