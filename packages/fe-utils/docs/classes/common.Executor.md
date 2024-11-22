[@qlover/fe-utils - v1.0.6](../README.md) / [common](../modules/common.md) / Executor

# Class: Executor

[common](../modules/common.md).Executor

## Hierarchy

- **`Executor`**

  ↳ [`AsyncExecutor`](common.AsyncExecutor.md)

  ↳ [`SyncExecutor`](common.SyncExecutor.md)

## Table of contents

### Constructors

- [constructor](common.Executor.md#constructor)

### Methods

- [exec](common.Executor.md#exec)
- [execNoError](common.Executor.md#execnoerror)
- [runHook](common.Executor.md#runhook)
- [use](common.Executor.md#use)

## Constructors

### constructor

• **new Executor**(`config?`): [`Executor`](common.Executor.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`ExecutorConfig`](../interfaces/common.ExecutorConfig.md) |

#### Returns

[`Executor`](common.Executor.md)

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:76](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/Executor.ts#L76)

## Methods

### exec

▸ **exec**\<`T`\>(`task`): `T` \| `Promise`\<`T`\>

execute task and return result

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `task` | [`Task`](../modules/common.md#task)\<`T`, `unknown`\> | task |

#### Returns

`T` \| `Promise`\<`T`\>

**`Throw`**

if task execution fails, throw ExecutorError

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:109](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/Executor.ts#L109)

▸ **exec**\<`T`\>(`data`, `task`): `T` \| `Promise`\<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `unknown` |
| `task` | [`Task`](../modules/common.md#task)\<`T`, `unknown`\> |

#### Returns

`T` \| `Promise`\<`T`\>

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:110](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/Executor.ts#L110)

___

### execNoError

▸ **execNoError**\<`T`\>(`task`): [`ExecutorError`](common.ExecutorError.md) \| `T` \| `Promise`\<[`ExecutorError`](common.ExecutorError.md) \| `T`\>

execute task and return result without throwing error, wrap all errors as ExecutorError

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `task` | [`Task`](../modules/common.md#task)\<`T`, `unknown`\> | task |

#### Returns

[`ExecutorError`](common.ExecutorError.md) \| `T` \| `Promise`\<[`ExecutorError`](common.ExecutorError.md) \| `T`\>

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:116](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/Executor.ts#L116)

▸ **execNoError**\<`T`\>(`data`, `task`): [`ExecutorError`](common.ExecutorError.md) \| `T` \| `Promise`\<[`ExecutorError`](common.ExecutorError.md) \| `T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `unknown` |
| `task` | [`Task`](../modules/common.md#task)\<`T`, `unknown`\> |

#### Returns

[`ExecutorError`](common.ExecutorError.md) \| `T` \| `Promise`\<[`ExecutorError`](common.ExecutorError.md) \| `T`\>

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:119](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/Executor.ts#L119)

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

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:98](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/Executor.ts#L98)

___

### use

▸ **use**(`plugin`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `plugin` | [`ExecutorPlugin`](common.ExecutorPlugin.md)\<`unknown`, `unknown`\> |

#### Returns

`void`

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:78](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/Executor.ts#L78)
