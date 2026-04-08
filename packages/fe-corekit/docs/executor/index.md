## `Executor` (Module)

**Type:** `module Executor`

Lifecycle-based task execution framework with plugin support

This module provides a powerful and flexible task execution framework that supports
both synchronous and asynchronous operations with a comprehensive plugin system.
It enables building complex execution pipelines with lifecycle hooks, error handling,
retry logic, and context management.

Core functionality:

- Task execution: Execute tasks with full lifecycle management
  - Async execution with `LifecycleExecutor`
  - Sync execution with `LifecycleSyncExecutor`
  - Mixed sync/async support through await
  - Type-safe task definitions

- Plugin system: Extensible architecture for custom behaviors
  - Lifecycle hooks: before, exec, after, onError, onFinally
  - Plugin composition and chaining
  - Context sharing between plugins
  - Built-in plugins (Retry, Abort)

- Context management: Shared state across execution pipeline
  - Parameter passing and transformation
  - Context inheritance and extension
  - Type-safe context access
  - Immutable context snapshots

- Error handling: Comprehensive error management
  - ExecutorError with detailed information
  - Error recovery through plugins
  - Error transformation and logging
  - No-throw execution mode

### Exported Members

**Implementations:**

- `LifecycleExecutor`: Async task executor with plugin support
- `LifecycleSyncExecutor`: Sync task executor with plugin support
- `ExecutorContextImpl`: Default context implementation
- `BasePluginExecutor`: Base class for plugin executors

**Interfaces:**

- `ExecutorInterface`: Core executor interface
- `ExecutorContextInterface`: Context interface
- `LifecyclePluginInterface`: Plugin interface for async executors
- `SyncLifecyclePluginInterface`: Plugin interface for sync executors
- `ExecutorHookRuntimesInterface`: Hook runtime information

**Plugins:**

- `RetryPlugin`: Automatic retry logic with configurable strategies

**Utilities:**

- `ExecutorError`: Custom error class for executor failures
- `pluginHook`: Async plugin hook utilities
- `pluginHookSync`: Sync plugin hook utilities
- Constants for error identification

### Basic Usage

```typescript
import { LifecycleExecutor } from '@qlover/fe-corekit';

// Create executor
const executor = new LifecycleExecutor();

// Execute async task
const result = await executor.exec(async (ctx) => {
  const response = await fetch('https://api.example.com/data');
  return response.json();
});

// Execute with parameters
const processed = await executor.exec({ input: 'hello' }, async (ctx) => {
  return ctx.parameters.input.toUpperCase();
});
```

### Plugin Usage

```typescript
import { LifecycleExecutor, RetryPlugin } from '@qlover/fe-corekit';

const executor = new LifecycleExecutor();

// Add retry plugin
executor.use(
  new RetryPlugin({
    maxRetries: 3,
    delay: 1000,
    backoff: 2
  })
);

// Add custom plugin
executor.use({
  name: 'logger',
  onBefore: async (ctx) => {
    console.log('Starting:', ctx.parameters);
  },
  onAfter: async (ctx, result) => {
    console.log('Completed:', result);
    return result;
  },
  onError: async (ctx, error) => {
    console.error('Failed:', error);
    throw error;
  }
});

const result = await executor.exec(async (ctx) => {
  return await riskyOperation();
});
```

### Error Handling

```typescript
import { LifecycleExecutor, ExecutorError } from '@qlover/fe-corekit';

const executor = new LifecycleExecutor();

// Try-catch pattern
try {
  const result = await executor.exec(async (ctx) => {
    throw new Error('Task failed');
  });
} catch (error) {
  if (error instanceof ExecutorError) {
    console.error('Executor error:', error.message);
  }
}

// No-throw pattern
const result = await executor.execNoError(async (ctx) => {
  throw new Error('Task failed');
});

if (result instanceof ExecutorError) {
  console.error('Task failed:', result);
} else {
  console.log('Task succeeded:', result);
}
```

### Advanced Plugin Development

```typescript
import {
  LifecyclePluginInterface,
  ExecutorContextInterface
} from '@qlover/fe-corekit';

class TimingPlugin implements LifecyclePluginInterface {
  name = 'timing';
  private startTime: number = 0;

  async onBefore(ctx: ExecutorContextInterface): Promise<void> {
    this.startTime = Date.now();
  }

  async onAfter<R>(ctx: ExecutorContextInterface, result: R): Promise<R> {
    const duration = Date.now() - this.startTime;
    console.log(`Execution took ${duration}ms`);
    return result;
  }
}

const executor = new LifecycleExecutor();
executor.use(new TimingPlugin());
```

### Sync Executor

```typescript
import { LifecycleSyncExecutor } from '@qlover/fe-corekit';

const executor = new LifecycleSyncExecutor();

// Execute sync task
const result = executor.exec((ctx) => {
  return ctx.parameters.value * 2;
});

// With parameters
const doubled = executor.exec({ value: 21 }, (ctx) => ctx.parameters.value * 2);
```

**See:**

- <a href="./impl/LifecycleExecutor.md#lifecycleexecutor-class" class="tsd-kind-class">LifecycleExecutor</a> for async execution
- <a href="./impl/LifecycleSyncExecutor.md#lifecyclesyncexecutor-class" class="tsd-kind-class">LifecycleSyncExecutor</a> for sync execution
- <a href="./interface/LifecyclePluginInterface.md#lifecycleplugininterface-interface" class="tsd-kind-interface">LifecyclePluginInterface</a> for plugin development

---
