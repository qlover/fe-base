[@qlover/fe-utils - v1.0.6](../README.md) / [executor](../modules/executor.md) / RetryPlugin

# Class: RetryPlugin

[executor](../modules/executor.md).RetryPlugin

Plugin that implements retry logic for failed task executions

Features:
- Configurable maximum retry attempts
- Fixed or exponential backoff delay
- Custom retry condition function
- Safe maximum retry limit

**`Implements`**

**`Example`**

```typescript
// Basic usage with default options
const executor = new AsyncExecutor();
executor.use(new RetryPlugin());

// Advanced configuration
const retryPlugin = new RetryPlugin({
  maxRetries: 5,
  retryDelay: 2000,
  useExponentialBackoff: true,
  shouldRetry: (error) => {
    return error.message !== 'Invalid credentials';
  }
});

// Usage with API calls
const result = await executor.exec(async () => {
  const response = await fetch('https://api.example.com/data');
  if (!response.ok) {
    throw new Error('API request failed');
  }
  return response.json();
});
```

## Implements

- [`ExecutorPlugin`](executor.ExecutorPlugin.md)

## Table of contents

### Constructors

- [constructor](executor.RetryPlugin.md#constructor)

### Properties

- [onlyOne](executor.RetryPlugin.md#onlyone)

### Methods

- [onExec](executor.RetryPlugin.md#onexec)
- [retry](executor.RetryPlugin.md#retry)

## Constructors

### constructor

• **new RetryPlugin**(`options?`): [`RetryPlugin`](executor.RetryPlugin.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `Partial`\<[`RetryOptions`](../interfaces/executor.RetryOptions.md)\> |

#### Returns

[`RetryPlugin`](executor.RetryPlugin.md)

#### Defined in

[packages/fe-utils/common/executor/RetryPlugin.ts:101](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/RetryPlugin.ts#L101)

## Properties

### onlyOne

• `Readonly` **onlyOne**: ``true``

Ensures only one instance of RetryPlugin is used per executor

#### Implementation of

[ExecutorPlugin](executor.ExecutorPlugin.md).[onlyOne](executor.ExecutorPlugin.md#onlyone)

#### Defined in

[packages/fe-utils/common/executor/RetryPlugin.ts:94](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/RetryPlugin.ts#L94)

## Methods

### onExec

▸ **onExec**\<`T`\>(`task`): `Promise`\<`void` \| `T`\>

Custom execution hook that implements retry logic
Intercepts task execution to add retry capability

#### Type parameters

| Name | Description |
| :------ | :------ |
| `T` | Type of task return value |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `task` | [`PromiseTask`](../modules/executor.md#promisetask)\<`T`\> | Task to be executed with retry support |

#### Returns

`Promise`\<`void` \| `T`\>

Promise resolving to task result

#### Implementation of

[ExecutorPlugin](executor.ExecutorPlugin.md).[onExec](executor.ExecutorPlugin.md#onexec)

#### Defined in

[packages/fe-utils/common/executor/RetryPlugin.ts:138](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/RetryPlugin.ts#L138)

___

### retry

▸ **retry**\<`T`\>(`fn`, `options`, `retryCount`): `Promise`\<`undefined` \| `T`\>

Core retry implementation
Recursively attempts to execute the task until success or max retries reached

Retry process:
1. Attempt task execution
2. On failure, check if retry is possible
3. Apply delay (fixed or exponential)
4. Recursively retry with decremented count

#### Type parameters

| Name | Description |
| :------ | :------ |
| `T` | Type of task return value |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fn` | [`PromiseTask`](../modules/executor.md#promisetask)\<`T`\> | Function to retry |
| `options` | [`RetryOptions`](../interfaces/executor.RetryOptions.md) | Retry configuration options |
| `retryCount` | `number` | Number of retries remaining |

#### Returns

`Promise`\<`undefined` \| `T`\>

Promise resolving to task result

**`Throws`**

When all retry attempts fail

#### Defined in

[packages/fe-utils/common/executor/RetryPlugin.ts:187](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/RetryPlugin.ts#L187)
