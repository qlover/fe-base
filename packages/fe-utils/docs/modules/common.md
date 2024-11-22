[@qlover/fe-utils - v1.0.6](../README.md) / common

# Module: common

## Table of contents

### Enumerations

- [FetchRequestErrorID](../enums/common.FetchRequestErrorID.md)

### Classes

- [AbortPlugin](../classes/common.AbortPlugin.md)
- [AsyncExecutor](../classes/common.AsyncExecutor.md)
- [Executor](../classes/common.Executor.md)
- [ExecutorError](../classes/common.ExecutorError.md)
- [ExecutorPlugin](../classes/common.ExecutorPlugin.md)
- [FetchRequest](../classes/common.FetchRequest.md)
- [FetchRequestError](../classes/common.FetchRequestError.md)
- [FetchURLPlugin](../classes/common.FetchURLPlugin.md)
- [Logger](../classes/common.Logger.md)
- [RequestExecutor](../classes/common.RequestExecutor.md)
- [RetryPlugin](../classes/common.RetryPlugin.md)
- [SyncExecutor](../classes/common.SyncExecutor.md)

### Interfaces

- [ExecutorConfig](../interfaces/common.ExecutorConfig.md)
- [FetchRequestConfig](../interfaces/common.FetchRequestConfig.md)
- [RequestConfig](../interfaces/common.RequestConfig.md)
- [RetryOptions](../interfaces/common.RetryOptions.md)

### Type Aliases

- [ExecOptions](common.md#execoptions)
- [LogArgument](common.md#logargument)
- [LogLevel](common.md#loglevel)
- [PromiseTask](common.md#promisetask)
- [RequestMethod](common.md#requestmethod)
- [SyncTask](common.md#synctask)
- [Task](common.md#task)

### Variables

- [LEVELS](common.md#levels)

## Type Aliases

### ExecOptions

Ƭ **ExecOptions**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `isDryRun?` | `boolean` |
| `isExternal?` | `boolean` |

#### Defined in

[packages/fe-utils/common/logger/index.ts:19](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/logger/index.ts#L19)

___

### LogArgument

Ƭ **LogArgument**: `unknown`

#### Defined in

[packages/fe-utils/common/logger/index.ts:17](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/logger/index.ts#L17)

___

### LogLevel

Ƭ **LogLevel**: typeof [`LEVELS`](common.md#levels)[keyof typeof [`LEVELS`](common.md#levels)]

#### Defined in

[packages/fe-utils/common/logger/index.ts:16](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/logger/index.ts#L16)

___

### PromiseTask

Ƭ **PromiseTask**\<`T`, `D`\>: (`data`: `D`) => `Promise`\<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T` |
| `D` | `unknown` |

#### Type declaration

▸ (`data`): `Promise`\<`T`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `D` |

##### Returns

`Promise`\<`T`\>

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:1](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/Executor.ts#L1)

___

### RequestMethod

Ƭ **RequestMethod**: ``"GET"`` \| ``"POST"`` \| ``"PUT"`` \| ``"DELETE"`` \| ``"PATCH"`` \| ``"HEAD"`` \| ``"OPTIONS"``

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:4](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/RequestExecutor.ts#L4)

___

### SyncTask

Ƭ **SyncTask**\<`T`, `D`\>: (`data`: `D`) => `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T` |
| `D` | `unknown` |

#### Type declaration

▸ (`data`): `T`

##### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `D` |

##### Returns

`T`

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:2](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/Executor.ts#L2)

___

### Task

Ƭ **Task**\<`T`, `D`\>: [`PromiseTask`](common.md#promisetask)\<`T`, `D`\> \| [`SyncTask`](common.md#synctask)\<`T`, `D`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T` |
| `D` | `unknown` |

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:3](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/Executor.ts#L3)

## Variables

### LEVELS

• `Const` **LEVELS**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `DEBUG` | ``"DEBUG"`` |
| `ERROR` | ``"ERROR"`` |
| `INFO` | ``"INFO"`` |
| `LOG` | ``"LOG"`` |
| `WARN` | ``"WARN"`` |

#### Defined in

[packages/fe-utils/common/logger/index.ts:8](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/logger/index.ts#L8)
