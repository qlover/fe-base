[@qlover/fe-utils - v1.0.6](../README.md) / [common](../modules/common.md) / SyncExecutor

# Class: SyncExecutor

[common](../modules/common.md).SyncExecutor

sync executor

## Hierarchy

- [`Executor`](common.Executor.md)

  ↳ **`SyncExecutor`**

## Table of contents

### Constructors

- [constructor](common.SyncExecutor.md#constructor)

### Methods

- [exec](common.SyncExecutor.md#exec)
- [execNoError](common.SyncExecutor.md#execnoerror)
- [runHook](common.SyncExecutor.md#runhook)
- [use](common.SyncExecutor.md#use)

## Constructors

### constructor

• **new SyncExecutor**(`config?`): [`SyncExecutor`](common.SyncExecutor.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`ExecutorConfig`](../interfaces/common.ExecutorConfig.md) |

#### Returns

[`SyncExecutor`](common.SyncExecutor.md)

#### Inherited from

[Executor](common.Executor.md).[constructor](common.Executor.md#constructor)

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:76](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/Executor.ts#L76)

## Methods

### exec

▸ **exec**\<`T`, `D`\>(`dataOrTask`, `task?`): `T`

execute task and return result

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T` |
| `D` | `unknown` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `dataOrTask` | `D` \| [`SyncTask`](../modules/common.md#synctask)\<`T`, `D`\> | task |
| `task?` | [`SyncTask`](../modules/common.md#synctask)\<`T`, `D`\> | - |

#### Returns

`T`

**`Throw`**

if task execution fails, throw ExecutorError

#### Overrides

[Executor](common.Executor.md).[exec](common.Executor.md#exec)

#### Defined in

[packages/fe-utils/common/executor/SyncExecutor.ts:51](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/SyncExecutor.ts#L51)

___

### execNoError

▸ **execNoError**\<`T`\>(`dataOrTask`, `task?`): [`ExecutorError`](common.ExecutorError.md) \| `T`

execute task and return result without throwing error, wrap all errors as ExecutorError

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `dataOrTask` | `unknown` | task |
| `task?` | [`SyncTask`](../modules/common.md#synctask)\<`T`\> | - |

#### Returns

[`ExecutorError`](common.ExecutorError.md) \| `T`

#### Overrides

[Executor](common.Executor.md).[execNoError](common.Executor.md#execnoerror)

#### Defined in

[packages/fe-utils/common/executor/SyncExecutor.ts:40](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/SyncExecutor.ts#L40)

___

### runHook

▸ **runHook**(`plugins`, `name`, `...args`): `unknown`

run hook

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `plugins` | [`ExecutorPlugin`](common.ExecutorPlugin.md)\<`unknown`, `unknown`\>[] | plugins |
| `name` | keyof [`ExecutorPlugin`](common.ExecutorPlugin.md)\<`unknown`, `unknown`\> | hook name |
| `...args` | `unknown`[] | hook args |

#### Returns

`unknown`

#### Overrides

[Executor](common.Executor.md).[runHook](common.Executor.md#runhook)

#### Defined in

[packages/fe-utils/common/executor/SyncExecutor.ts:7](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/SyncExecutor.ts#L7)

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
