[@qlover/fe-utils - v1.0.6](../README.md) / executor

# Module: executor

Export executor related modules

## Table of contents

### Enumerations

- [FetchRequestErrorID](../enums/executor.FetchRequestErrorID.md)

### Classes

- [AbortPlugin](../classes/executor.AbortPlugin.md)
- [AsyncExecutor](../classes/executor.AsyncExecutor.md)
- [Executor](../classes/executor.Executor.md)
- [ExecutorError](../classes/executor.ExecutorError.md)
- [ExecutorPlugin](../classes/executor.ExecutorPlugin.md)
- [FetchRequest](../classes/executor.FetchRequest.md)
- [FetchRequestError](../classes/executor.FetchRequestError.md)
- [FetchURLPlugin](../classes/executor.FetchURLPlugin.md)
- [Logger](../classes/executor.Logger.md)
- [RequestExecutor](../classes/executor.RequestExecutor.md)
- [RetryPlugin](../classes/executor.RetryPlugin.md)
- [SyncExecutor](../classes/executor.SyncExecutor.md)

### Interfaces

- [ExecOptions](../interfaces/executor.ExecOptions.md)
- [ExecutorConfig](../interfaces/executor.ExecutorConfig.md)
- [FetchRequestConfig](../interfaces/executor.FetchRequestConfig.md)
- [RequestConfig](../interfaces/executor.RequestConfig.md)
- [RetryOptions](../interfaces/executor.RetryOptions.md)

### Type Aliases

- [LogArgument](executor.md#logargument)
- [LogLevel](executor.md#loglevel)
- [PromiseTask](executor.md#promisetask)
- [RequestMethod](executor.md#requestmethod)
- [SyncTask](executor.md#synctask)
- [Task](executor.md#task)

### Variables

- [LEVELS](executor.md#levels)

## Type Aliases

### LogArgument

Ƭ **LogArgument**: `unknown`

#### Defined in

[packages/fe-utils/common/logger/index.ts:21](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/logger/index.ts#L21)

___

### LogLevel

Ƭ **LogLevel**: typeof [`LEVELS`](executor.md#levels)[keyof typeof [`LEVELS`](executor.md#levels)]

#### Defined in

[packages/fe-utils/common/logger/index.ts:20](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/logger/index.ts#L20)

___

### PromiseTask

Ƭ **PromiseTask**\<`T`, `D`\>: (`data`: `D`) => `Promise`\<`T`\>

Type definition for promise-based task

**`Example`**

```typescript
const promiseTask: PromiseTask<string, number> = async (data: number) => {
  return `Result: ${data}`;
};
```

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | `T` | Return type of the task |
| `D` | `unknown` | Input data type for the task |

#### Type declaration

▸ (`data`): `Promise`\<`T`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `D` |

##### Returns

`Promise`\<`T`\>

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:12](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/Executor.ts#L12)

___

### RequestMethod

Ƭ **RequestMethod**: ``"GET"`` \| ``"POST"`` \| ``"PUT"`` \| ``"DELETE"`` \| ``"PATCH"`` \| ``"HEAD"`` \| ``"OPTIONS"``

HTTP request methods supported by the executor
Follows standard HTTP method definitions

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:8](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/RequestExecutor.ts#L8)

___

### SyncTask

Ƭ **SyncTask**\<`T`, `D`\>: (`data`: `D`) => `T`

Type definition for synchronous task

**`Example`**

```typescript
const syncTask: SyncTask<string, number> = (data: number) => {
  return `Result: ${data}`;
};
```

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | `T` | Return type of the task |
| `D` | `unknown` | Input data type for the task |

#### Type declaration

▸ (`data`): `T`

##### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `D` |

##### Returns

`T`

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:25](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/Executor.ts#L25)

___

### Task

Ƭ **Task**\<`T`, `D`\>: [`PromiseTask`](executor.md#promisetask)\<`T`, `D`\> \| [`SyncTask`](executor.md#synctask)\<`T`, `D`\>

Union type for both promise and sync tasks

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | `T` | Return type of the task |
| `D` | `unknown` | Input data type for the task |

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:32](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/Executor.ts#L32)

## Variables

### LEVELS

• `Const` **LEVELS**: `Object`

Available log levels
Used to categorize and control log output

#### Type declaration

| Name | Type |
| :------ | :------ |
| `DEBUG` | ``"DEBUG"`` |
| `ERROR` | ``"ERROR"`` |
| `INFO` | ``"INFO"`` |
| `LOG` | ``"LOG"`` |
| `WARN` | ``"WARN"`` |

#### Defined in

[packages/fe-utils/common/logger/index.ts:12](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/logger/index.ts#L12)
