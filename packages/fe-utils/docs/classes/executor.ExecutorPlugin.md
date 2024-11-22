[@qlover/fe-utils - v1.0.6](../README.md) / [executor](../modules/executor.md) / ExecutorPlugin

# Class: ExecutorPlugin\<T, R\>

[executor](../modules/executor.md).ExecutorPlugin

Base plugin class for extending executor functionality.
Plugins provide a way to intercept and modify the execution flow at different stages:
- Before execution (onBefore)
- After successful execution (onSuccess)
- On error (onError)
- Custom execution logic (onExec)

**`Abstract`**

**`Example`**

```typescript
class LoggerPlugin extends ExecutorPlugin {
  onBefore(data: unknown) {
    console.log('Before execution:', data);
    return data;
  }

  onSuccess(result: unknown) {
    console.log('Execution succeeded:', result);
    return result;
  }

  onError(error: Error) {
    console.error('Execution failed:', error);
    throw error;
  }
}
```

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | `unknown` | Type of data being processed |
| `R` | `T` | Type of result after processing |

## Implemented by

- [`AbortPlugin`](executor.AbortPlugin.md)
- [`FetchURLPlugin`](executor.FetchURLPlugin.md)
- [`RetryPlugin`](executor.RetryPlugin.md)

## Table of contents

### Constructors

- [constructor](executor.ExecutorPlugin.md#constructor)

### Properties

- [onlyOne](executor.ExecutorPlugin.md#onlyone)

### Methods

- [enabled](executor.ExecutorPlugin.md#enabled)
- [onBefore](executor.ExecutorPlugin.md#onbefore)
- [onError](executor.ExecutorPlugin.md#onerror)
- [onExec](executor.ExecutorPlugin.md#onexec)
- [onSuccess](executor.ExecutorPlugin.md#onsuccess)

## Constructors

### constructor

• **new ExecutorPlugin**\<`T`, `R`\>(): [`ExecutorPlugin`](executor.ExecutorPlugin.md)\<`T`, `R`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `unknown` |
| `R` | `T` |

#### Returns

[`ExecutorPlugin`](executor.ExecutorPlugin.md)\<`T`, `R`\>

## Properties

### onlyOne

• `Optional` `Readonly` **onlyOne**: `boolean`

Indicates if only one instance of this plugin should exist in the executor
When true, attempting to add duplicate plugins will result in a warning

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:71](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/Executor.ts#L71)

## Methods

### enabled

▸ **enabled**(`name`, `...args`): `boolean`

Controls whether the plugin is active for specific hook executions

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | keyof [`ExecutorPlugin`](executor.ExecutorPlugin.md)\<`unknown`, `unknown`\> | Name of the hook being executed |
| `...args` | `unknown`[] | Arguments passed to the hook |

#### Returns

`boolean`

Boolean indicating if the plugin should be executed

**`Example`**

```typescript
enabled(name: keyof ExecutorPlugin, ...args: unknown[]) {
  // Only enable for error handling
  return name === 'onError';
}
```

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:87](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/Executor.ts#L87)

___

### onBefore

▸ **onBefore**(`data?`): `unknown`

Hook executed before the main task
Can modify the input data before it reaches the task

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data?` | `unknown` | Input data |

#### Returns

`unknown`

Modified data or Promise of modified data

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:95](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/Executor.ts#L95)

___

### onError

▸ **onError**(`error`, `data?`): `void` \| [`ExecutorError`](executor.ExecutorError.md) \| `Promise`\<`void` \| [`ExecutorError`](executor.ExecutorError.md)\>

Error handling hook
- For `exec`: returning a value or throwing will break the chain
- For `execNoError`: returning a value or throwing will return the error

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `error` | `Error` | Error that occurred |
| `data?` | `unknown` | Original input data |

#### Returns

`void` \| [`ExecutorError`](executor.ExecutorError.md) \| `Promise`\<`void` \| [`ExecutorError`](executor.ExecutorError.md)\>

ExecutorError, void, or Promise of either

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:106](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/Executor.ts#L106)

___

### onExec

▸ **onExec**\<`T`\>(`task`): `void` \| `T` \| `Promise`\<`void` \| `T`\>

Custom execution logic hook
Only the first plugin with onExec will be used

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `task` | [`Task`](../modules/executor.md#task)\<`T`, `unknown`\> | Task to be executed |

#### Returns

`void` \| `T` \| `Promise`\<`void` \| `T`\>

Task result or Promise of result

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:125](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/Executor.ts#L125)

___

### onSuccess

▸ **onSuccess**(`result`): `R` \| `Promise`\<`R`\>

Hook executed after successful task completion
Can transform the task result

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `result` | `T` | Task execution result |

#### Returns

`R` \| `Promise`\<`R`\>

Modified result or Promise of modified result

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:117](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/Executor.ts#L117)
