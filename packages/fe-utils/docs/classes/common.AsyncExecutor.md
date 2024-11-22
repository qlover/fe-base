[@qlover/fe-utils - v1.0.6](../README.md) / [common](../modules/common.md) / AsyncExecutor

# Class: AsyncExecutor

[common](../modules/common.md).AsyncExecutor

async executor

## Hierarchy

- [`Executor`](common.Executor.md)

  ↳ **`AsyncExecutor`**

## Table of contents

### Constructors

- [constructor](common.AsyncExecutor.md#constructor)

### Methods

- [exec](common.AsyncExecutor.md#exec)
- [execNoError](common.AsyncExecutor.md#execnoerror)
- [run](common.AsyncExecutor.md#run)
- [runHook](common.AsyncExecutor.md#runhook)
- [use](common.AsyncExecutor.md#use)

## Constructors

### constructor

• **new AsyncExecutor**(`config?`): [`AsyncExecutor`](common.AsyncExecutor.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`ExecutorConfig`](../interfaces/common.ExecutorConfig.md) |

#### Returns

[`AsyncExecutor`](common.AsyncExecutor.md)

#### Inherited from

[Executor](common.Executor.md).[constructor](common.Executor.md#constructor)

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:76](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/Executor.ts#L76)

## Methods

### exec

▸ **exec**\<`T`, `D`\>(`dataOrTask`, `task?`): `Promise`\<`T`\>

execute task and return result

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T` |
| `D` | `unknown` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `dataOrTask` | `unknown` | task |
| `task?` | [`PromiseTask`](../modules/common.md#promisetask)\<`T`, `D`\> | - |

#### Returns

`Promise`\<`T`\>

**`Throw`**

if task execution fails, throw ExecutorError

#### Overrides

[Executor](common.Executor.md).[exec](common.Executor.md#exec)

#### Defined in

[packages/fe-utils/common/executor/AsyncExecutor.ts:56](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/AsyncExecutor.ts#L56)

___

### execNoError

▸ **execNoError**\<`T`\>(`dataOrTask`, `task?`): `Promise`\<[`ExecutorError`](common.ExecutorError.md) \| `T`\>

execute task and return result without throwing error, wrap all errors as ExecutorError

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `dataOrTask` | `unknown` | task |
| `task?` | [`PromiseTask`](../modules/common.md#promisetask)\<`T`\> | - |

#### Returns

`Promise`\<[`ExecutorError`](common.ExecutorError.md) \| `T`\>

#### Overrides

[Executor](common.Executor.md).[execNoError](common.Executor.md#execnoerror)

#### Defined in

[packages/fe-utils/common/executor/AsyncExecutor.ts:45](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/AsyncExecutor.ts#L45)

___

### run

▸ **run**\<`T`, `D`\>(`data`, `actualTask`): `Promise`\<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T` |
| `D` | `unknown` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `D` |
| `actualTask` | [`PromiseTask`](../modules/common.md#promisetask)\<`T`, `D`\> |

#### Returns

`Promise`\<`T`\>

#### Defined in

[packages/fe-utils/common/executor/AsyncExecutor.ts:84](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/AsyncExecutor.ts#L84)

___

### runHook

▸ **runHook**(`plugins`, `name`, `...args`): `Promise`\<`unknown`\>

run hook

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `plugins` | [`ExecutorPlugin`](common.ExecutorPlugin.md)\<`unknown`, `unknown`\>[] | plugins |
| `name` | keyof [`ExecutorPlugin`](common.ExecutorPlugin.md)\<`unknown`, `unknown`\> | hook name |
| `...args` | `unknown`[] | hook args |

#### Returns

`Promise`\<`unknown`\>

#### Overrides

[Executor](common.Executor.md).[runHook](common.Executor.md#runhook)

#### Defined in

[packages/fe-utils/common/executor/AsyncExecutor.ts:12](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/AsyncExecutor.ts#L12)

___

### use

▸ **use**(`plugin`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `plugin` | [`ExecutorPlugin`](common.ExecutorPlugin.md)\<`unknown`, `unknown`\> |

#### Returns

`void`

#### Inherited from

[Executor](common.Executor.md).[use](common.Executor.md#use)

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:78](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/Executor.ts#L78)
