[@qlover/fe-utils - v1.0.6](../README.md) / [common](../modules/common.md) / ExecutorPlugin

# Class: ExecutorPlugin\<T, R\>

[common](../modules/common.md).ExecutorPlugin

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `unknown` |
| `R` | `T` |

## Implemented by

- [`AbortPlugin`](common.AbortPlugin.md)
- [`FetchURLPlugin`](common.FetchURLPlugin.md)
- [`RetryPlugin`](common.RetryPlugin.md)

## Table of contents

### Constructors

- [constructor](common.ExecutorPlugin.md#constructor)

### Properties

- [onlyOne](common.ExecutorPlugin.md#onlyone)

### Methods

- [enabled](common.ExecutorPlugin.md#enabled)
- [onBefore](common.ExecutorPlugin.md#onbefore)
- [onError](common.ExecutorPlugin.md#onerror)
- [onExec](common.ExecutorPlugin.md#onexec)
- [onSuccess](common.ExecutorPlugin.md#onsuccess)

## Constructors

### constructor

• **new ExecutorPlugin**\<`T`, `R`\>(): [`ExecutorPlugin`](common.ExecutorPlugin.md)\<`T`, `R`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `unknown` |
| `R` | `T` |

#### Returns

[`ExecutorPlugin`](common.ExecutorPlugin.md)\<`T`, `R`\>

## Properties

### onlyOne

• `Optional` `Readonly` **onlyOne**: `boolean`

only one instance of the same plugin

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:10](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/Executor.ts#L10)

## Methods

### enabled

▸ **enabled**(`name`, `...args`): `boolean`

override to enable/disable plugin.

receive args from `exec` or `execNoError`

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | keyof [`ExecutorPlugin`](common.ExecutorPlugin.md)\<`unknown`, `unknown`\> |
| `...args` | `unknown`[] |

#### Returns

`boolean`

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:17](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/Executor.ts#L17)

___

### onBefore

▸ **onBefore**(`data?`): `unknown`

**has return value, not break the chain**

#### Parameters

| Name | Type |
| :------ | :------ |
| `data?` | `unknown` |

#### Returns

`unknown`

**`Access`**

plugin

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:23](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/Executor.ts#L23)

___

### onError

▸ **onError**(`error`, `data?`): `void` \| [`ExecutorError`](common.ExecutorError.md) \| `Promise`\<`void` \| [`ExecutorError`](common.ExecutorError.md)\>

- if call `exec`, onError has return value or throw any error, exec will break the chain and throw error
- if call `execNoError`, onError has return value or throw any error, execNoError will return the error

**as long as it is captured by the error chain, the chain will be terminated**

#### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `Error` |
| `data?` | `unknown` |

#### Returns

`void` \| [`ExecutorError`](common.ExecutorError.md) \| `Promise`\<`void` \| [`ExecutorError`](common.ExecutorError.md)\>

**`Access`**

plugin

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:31](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/Executor.ts#L31)

___

### onExec

▸ **onExec**\<`T`\>(`task`): `void` \| `T` \| `Promise`\<`void` \| `T`\>

can override exec run logic.

**only use first bind plugin's onExec**

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `task` | [`Task`](../modules/common.md#task)\<`T`, `unknown`\> |

#### Returns

`void` \| `T` \| `Promise`\<`void` \| `T`\>

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:48](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/Executor.ts#L48)

___

### onSuccess

▸ **onSuccess**(`result`): `R` \| `Promise`\<`R`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `result` | `T` |

#### Returns

`R` \| `Promise`\<`R`\>

**`Access`**

plugin
**has return value, break the chain**

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:39](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/Executor.ts#L39)
