[@qlover/fe-utils - v1.0.6](../README.md) / [executor](../modules/executor.md) / SyncExecutor

# Class: SyncExecutor

[executor](../modules/executor.md).SyncExecutor

Synchronous executor class that extends the base Executor
Provides synchronous task execution with plugin support

Key features:
1. Synchronous plugin hook execution
2. No Promise-based operations
3. Immediate error handling
4. Direct execution flow

Use this executor when:
1. All operations are synchronous
2. You need immediate results
3. Performance is critical
4. No async operations are involved

**`Example`**

```typescript
// Create a sync executor
const executor = new SyncExecutor();

// Add plugins for different purposes
executor.use(new ValidationPlugin());
executor.use(new LoggerPlugin());

// Example 1: Basic sync task execution
const result = executor.exec((data) => {
  return data.toUpperCase();
});

// Example 2: Execution with input data
const data = { value: 'hello' };
const result = executor.exec(data, (input) => {
  return input.value.toUpperCase();
});

// Example 3: Error handling with execNoError
const result = executor.execNoError(() => {
  throw new Error('Validation Error');
}); // Returns ExecutorError instead of throwing
```

## Hierarchy

- [`Executor`](executor.Executor.md)

  ↳ **`SyncExecutor`**

## Table of contents

### Constructors

- [constructor](executor.SyncExecutor.md#constructor)

### Methods

- [exec](executor.SyncExecutor.md#exec)
- [execNoError](executor.SyncExecutor.md#execnoerror)
- [run](executor.SyncExecutor.md#run)
- [runHook](executor.SyncExecutor.md#runhook)
- [use](executor.SyncExecutor.md#use)

## Constructors

### constructor

• **new SyncExecutor**(`config?`): [`SyncExecutor`](executor.SyncExecutor.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`ExecutorConfig`](../interfaces/executor.ExecutorConfig.md) |

#### Returns

[`SyncExecutor`](executor.SyncExecutor.md)

#### Inherited from

[Executor](executor.Executor.md).[constructor](executor.Executor.md#constructor)

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:187](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/Executor.ts#L187)

## Methods

### exec

▸ **exec**\<`T`, `D`\>(`dataOrTask`, `task?`): `T`

Execute synchronous task with full plugin pipeline
Core method for task execution with plugin support

Execution flow:
1. Validate and prepare task
2. Check for custom execution plugins
3. Execute task with plugin pipeline

Performance considerations:
- No async overhead
- Direct execution path
- Immediate results

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | `T` | Type of task return value |
| `D` | `unknown` | Type of task data |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `dataOrTask` | `unknown` | Task data or task function |
| `task?` | [`SyncTask`](../modules/executor.md#synctask)\<`T`, `D`\> | Task function (optional) |

#### Returns

`T`

Task execution result

**`Throws`**

When task is not a function

**`Example`**

```typescript
// Example with data transformation
const data = { numbers: [1, 2, 3] };
const task = (input) => {
  return input.numbers.map(n => n * 2);
};

const result = executor.exec(data, task);

// Example with validation
const result = executor.exec((data) => {
  if (typeof data !== 'string') {
    throw new Error('Data must be string');
  }
  return data.trim();
});
```

#### Overrides

[Executor](executor.Executor.md).[exec](executor.Executor.md#exec)

#### Defined in

[packages/fe-utils/common/executor/SyncExecutor.ts:187](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/SyncExecutor.ts#L187)

___

### execNoError

▸ **execNoError**\<`T`\>(`dataOrTask`, `task?`): [`ExecutorError`](executor.ExecutorError.md) \| `T`

Execute task without throwing errors
Wraps all errors in ExecutorError for safe error handling

Advantages over try-catch:
1. Standardized error handling
2. No exception propagation
3. Consistent error types

#### Type parameters

| Name | Description |
| :------ | :------ |
| `T` | Type of task return value |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `dataOrTask` | `unknown` | Task data or task function |
| `task?` | [`SyncTask`](../modules/executor.md#synctask)\<`T`\> | Task function (optional) |

#### Returns

[`ExecutorError`](executor.ExecutorError.md) \| `T`

Task result or ExecutorError

**`Example`**

```typescript
const result = executor.execNoError((data) => {
  if (!data.isValid) {
    throw new Error('Invalid data');
  }
  return data.value;
});

if (result instanceof ExecutorError) {
  console.log('Task failed:', result.message);
} else {
  console.log('Task succeeded:', result);
}
```

#### Overrides

[Executor](executor.Executor.md).[execNoError](executor.Executor.md#execnoerror)

#### Defined in

[packages/fe-utils/common/executor/SyncExecutor.ts:136](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/SyncExecutor.ts#L136)

___

### run

▸ **run**\<`T`, `D`\>(`data`, `actualTask`): `T`

Core method to run synchronous task with plugin hooks
Implements the complete execution pipeline with all plugin hooks

Pipeline stages:
1. onBefore hooks - Pre-process input data
2. Task execution - Run the actual task
3. onSuccess hooks - Post-process results
4. onError hooks - Handle any errors

Error handling strategy:
- Catches all errors
- Passes errors through plugin chain
- Wraps unhandled errors in ExecutorError

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | `T` | Type of task return value |
| `D` | `unknown` | Type of task data |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | `D` | Data to pass to the task |
| `actualTask` | [`SyncTask`](../modules/executor.md#synctask)\<`T`, `D`\> | Actual task function to execute |

#### Returns

`T`

Task execution result

**`Throws`**

When task execution fails

**`Example`**

```typescript
// Internal implementation example
private run(data, task) {
  try {
    const preparedData = this.runHook(this.plugins, 'onBefore', data);
    const result = task(preparedData);
    return this.runHook(this.plugins, 'onSuccess', result);
  } catch (error) {
    const handledError = this.runHook(
      this.plugins,
      'onError',
      error,
      data
    );
    // Error handling logic
  }
}
```

#### Defined in

[packages/fe-utils/common/executor/SyncExecutor.ts:257](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/SyncExecutor.ts#L257)

___

### runHook

▸ **runHook**(`plugins`, `name`, `...args`): `unknown`

Execute plugin hook functions synchronously
Manages the plugin execution chain and handles results

Plugin execution flow:
1. Check if plugin is enabled for the hook
2. Execute plugin hook if available
3. Handle plugin results and chain breaking conditions

Key differences from AsyncExecutor:
- All operations are synchronous
- Results are immediately available
- No await statements needed

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `plugins` | [`ExecutorPlugin`](executor.ExecutorPlugin.md)\<`unknown`, `unknown`\>[] | Array of plugins to execute |
| `name` | keyof [`ExecutorPlugin`](executor.ExecutorPlugin.md)\<`unknown`, `unknown`\> | Name of the hook function to execute |
| `...args` | `unknown`[] | Arguments to pass to the hook function |

#### Returns

`unknown`

Result of the hook function execution

**`Example`**

```typescript
// Internal usage example
const result = this.runHook(
  this.plugins,
  'onBefore',
  { value: 'test' }
);
```

#### Overrides

[Executor](executor.Executor.md).[runHook](executor.Executor.md#runhook)

#### Defined in

[packages/fe-utils/common/executor/SyncExecutor.ts:77](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/SyncExecutor.ts#L77)

___

### use

▸ **use**(`plugin`): `void`

Add a plugin to the executor

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `plugin` | [`ExecutorPlugin`](executor.ExecutorPlugin.md)\<`unknown`, `unknown`\> | Plugin instance to add |

#### Returns

`void`

#### Inherited from

[Executor](executor.Executor.md).[use](executor.Executor.md#use)

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:193](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/Executor.ts#L193)
