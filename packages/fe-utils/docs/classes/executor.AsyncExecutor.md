[@qlover/fe-utils - v1.0.6](../README.md) / [executor](../modules/executor.md) / AsyncExecutor

# Class: AsyncExecutor

[executor](../modules/executor.md).AsyncExecutor

Asynchronous executor class that extends the base Executor
Provides asynchronous task execution with plugin support

Key features:
1. Asynchronous plugin hook execution
2. Promise-based task handling
3. Error handling with async plugin support
4. Flexible execution flow control

**`Example`**

```typescript
// Create an async executor
const executor = new AsyncExecutor();

// Add plugins for different purposes
executor.use(new RetryPlugin({ maxAttempts: 3 }));
executor.use(new TimeoutPlugin({ timeout: 5000 }));

// Example 1: Basic async task execution
const result = await executor.exec(async (data) => {
  const response = await fetch('https://api.example.com/data');
  return response.json();
});

// Example 2: Execution with input data
const data = { id: 123 };
const result = await executor.exec(data, async (input) => {
  const response = await fetch(`https://api.example.com/data/${input.id}`);
  return response.json();
});

// Example 3: Error handling with execNoError
const result = await executor.execNoError(async () => {
  throw new Error('API Error');
}); // Returns ExecutorError instead of throwing
```

## Hierarchy

- [`Executor`](executor.Executor.md)

  ↳ **`AsyncExecutor`**

## Table of contents

### Constructors

- [constructor](executor.AsyncExecutor.md#constructor)

### Methods

- [exec](executor.AsyncExecutor.md#exec)
- [execNoError](executor.AsyncExecutor.md#execnoerror)
- [run](executor.AsyncExecutor.md#run)
- [runHook](executor.AsyncExecutor.md#runhook)
- [use](executor.AsyncExecutor.md#use)

## Constructors

### constructor

• **new AsyncExecutor**(`config?`): [`AsyncExecutor`](executor.AsyncExecutor.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`ExecutorConfig`](../interfaces/executor.ExecutorConfig.md) |

#### Returns

[`AsyncExecutor`](executor.AsyncExecutor.md)

#### Inherited from

[Executor](executor.Executor.md).[constructor](executor.Executor.md#constructor)

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:187](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/Executor.ts#L187)

## Methods

### exec

▸ **exec**\<`T`, `D`\>(`dataOrTask`, `task?`): `Promise`\<`T`\>

Execute asynchronous task with full plugin pipeline
Core method for task execution with plugin support

Execution flow:
1. Validate and prepare task
2. Check for custom execution plugins
3. Execute task with plugin pipeline

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | `T` | Type of task return value |
| `D` | `unknown` | Type of task data |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `dataOrTask` | `unknown` | Task data or task function |
| `task?` | [`PromiseTask`](../modules/executor.md#promisetask)\<`T`, `D`\> | Task function (optional) |

#### Returns

`Promise`\<`T`\>

Promise that resolves to task execution result

**`Throws`**

When task is not an async function

**`Example`**

```typescript
// Example with data and task separation
const data = { userId: 123 };
const task = async (input) => {
  const user = await db.users.findById(input.userId);
  return user.profile;
};

const profile = await executor.exec(data, task);

// Example with combined task
const result = await executor.exec(async () => {
  return await someAsyncOperation();
});
```

#### Overrides

[Executor](executor.Executor.md).[exec](executor.Executor.md#exec)

#### Defined in

[packages/fe-utils/common/executor/AsyncExecutor.ts:178](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/AsyncExecutor.ts#L178)

___

### execNoError

▸ **execNoError**\<`T`\>(`dataOrTask`, `task?`): `Promise`\<[`ExecutorError`](executor.ExecutorError.md) \| `T`\>

Execute task without throwing errors
Wraps all errors in ExecutorError for safe error handling

Use this method when you want to handle errors in the calling code
rather than using try-catch blocks

#### Type parameters

| Name | Description |
| :------ | :------ |
| `T` | Type of task return value |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `dataOrTask` | `unknown` | Task data or task function |
| `task?` | [`PromiseTask`](../modules/executor.md#promisetask)\<`T`\> | Task function (optional) |

#### Returns

`Promise`\<[`ExecutorError`](executor.ExecutorError.md) \| `T`\>

Promise that resolves to either task result or ExecutorError

**`Example`**

```typescript
const result = await executor.execNoError(async () => {
  if (Math.random() > 0.5) {
    throw new Error('Random failure');
  }
  return 'success';
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

[packages/fe-utils/common/executor/AsyncExecutor.ts:134](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/AsyncExecutor.ts#L134)

___

### run

▸ **run**\<`T`, `D`\>(`data`, `actualTask`): `Promise`\<`T`\>

Core method to run asynchronous task with plugin hooks
Implements the complete execution pipeline with all plugin hooks

Pipeline stages:
1. onBefore hooks - Pre-process input data
2. Task execution - Run the actual task
3. onSuccess hooks - Post-process results
4. onError hooks - Handle any errors

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | `T` | Type of task return value |
| `D` | `unknown` | Type of task data |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | `D` | Data to pass to the task |
| `actualTask` | [`PromiseTask`](../modules/executor.md#promisetask)\<`T`, `D`\> | Actual task function to execute |

#### Returns

`Promise`\<`T`\>

Promise that resolves to task execution result

**`Throws`**

When task execution fails

**`Example`**

```typescript
// Internal usage example
private async run(data, task) {
  try {
    const preparedData = await this.runHook(this.plugins, 'onBefore', data);
    const result = await task(preparedData);
    return await this.runHook(this.plugins, 'onSuccess', result);
  } catch (error) {
    // Error handling with plugin support
    const handledError = await this.runHook(
      this.plugins,
      'onError',
      error,
      data
    );
    // ... error handling logic ...
  }
}
```

#### Defined in

[packages/fe-utils/common/executor/AsyncExecutor.ts:244](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/AsyncExecutor.ts#L244)

___

### runHook

▸ **runHook**(`plugins`, `name`, `...args`): `Promise`\<`unknown`\>

Execute plugin hook functions asynchronously
Manages the plugin execution chain and handles results

Plugin execution flow:
1. Check if plugin is enabled for the hook
2. Execute plugin hook if available
3. Handle plugin results and chain breaking conditions

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `plugins` | [`ExecutorPlugin`](executor.ExecutorPlugin.md)\<`unknown`, `unknown`\>[] | Array of plugins to execute |
| `name` | keyof [`ExecutorPlugin`](executor.ExecutorPlugin.md)\<`unknown`, `unknown`\> | Name of the hook function to execute |
| `...args` | `unknown`[] | Arguments to pass to the hook function |

#### Returns

`Promise`\<`unknown`\>

Result of the hook function execution

**`Example`**

```typescript
// Internal usage example
const result = await this.runHook(
  this.plugins,
  'onBefore',
  { userId: 123 }
);
```

#### Overrides

[Executor](executor.Executor.md).[runHook](executor.Executor.md#runhook)

#### Defined in

[packages/fe-utils/common/executor/AsyncExecutor.ts:73](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/AsyncExecutor.ts#L73)

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
