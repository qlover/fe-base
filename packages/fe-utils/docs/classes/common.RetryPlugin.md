[@qlover/fe-utils - v1.0.6](../README.md) / [common](../modules/common.md) / RetryPlugin

# Class: RetryPlugin

[common](../modules/common.md).RetryPlugin

## Implements

- [`ExecutorPlugin`](common.ExecutorPlugin.md)

## Table of contents

### Constructors

- [constructor](common.RetryPlugin.md#constructor)

### Properties

- [onlyOne](common.RetryPlugin.md#onlyone)

### Methods

- [onExec](common.RetryPlugin.md#onexec)
- [retry](common.RetryPlugin.md#retry)

## Constructors

### constructor

• **new RetryPlugin**(`options?`): [`RetryPlugin`](common.RetryPlugin.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `Partial`\<[`RetryOptions`](../interfaces/common.RetryOptions.md)\> |

#### Returns

[`RetryPlugin`](common.RetryPlugin.md)

#### Defined in

[packages/fe-utils/common/executor/RetryPlugin.ts:33](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/RetryPlugin.ts#L33)

## Properties

### onlyOne

• `Readonly` **onlyOne**: ``true``

only one instance of the same plugin

#### Implementation of

[ExecutorPlugin](common.ExecutorPlugin.md).[onlyOne](common.ExecutorPlugin.md#onlyone)

#### Defined in

[packages/fe-utils/common/executor/RetryPlugin.ts:30](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/RetryPlugin.ts#L30)

## Methods

### onExec

▸ **onExec**\<`T`\>(`task`): `Promise`\<`void` \| `T`\>

can override exec run logic.

**only use first bind plugin's onExec**

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `task` | [`PromiseTask`](../modules/common.md#promisetask)\<`T`\> |

#### Returns

`Promise`\<`void` \| `T`\>

#### Implementation of

[ExecutorPlugin](common.ExecutorPlugin.md).[onExec](common.ExecutorPlugin.md#onexec)

#### Defined in

[packages/fe-utils/common/executor/RetryPlugin.ts:54](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/RetryPlugin.ts#L54)

___

### retry

▸ **retry**\<`T`\>(`fn`, `options`, `retryCount`): `Promise`\<`undefined` \| `T`\>

retry async function

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fn` | [`PromiseTask`](../modules/common.md#promisetask)\<`T`\> | need retry async function |
| `options` | [`RetryOptions`](../interfaces/common.RetryOptions.md) | - |
| `retryCount` | `number` | - |

#### Returns

`Promise`\<`undefined` \| `T`\>

- return async function result

#### Defined in

[packages/fe-utils/common/executor/RetryPlugin.ts:83](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/RetryPlugin.ts#L83)
