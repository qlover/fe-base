[@qlover/fe-utils - v1.0.6](../README.md) / [common](../modules/common.md) / AbortPlugin

# Class: AbortPlugin

[common](../modules/common.md).AbortPlugin

## Implements

- [`ExecutorPlugin`](common.ExecutorPlugin.md)

## Table of contents

### Constructors

- [constructor](common.AbortPlugin.md#constructor)

### Methods

- [abort](common.AbortPlugin.md#abort)
- [abortAll](common.AbortPlugin.md#abortall)
- [onBefore](common.AbortPlugin.md#onbefore)
- [onError](common.AbortPlugin.md#onerror)

## Constructors

### constructor

• **new AbortPlugin**(): [`AbortPlugin`](common.AbortPlugin.md)

#### Returns

[`AbortPlugin`](common.AbortPlugin.md)

## Methods

### abort

▸ **abort**(`config`): `void`

abort specified request

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`FetchRequestConfig`](../interfaces/common.FetchRequestConfig.md) |

#### Returns

`void`

#### Defined in

[packages/fe-utils/common/request/AbortPlugin.ts:61](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/AbortPlugin.ts#L61)

___

### abortAll

▸ **abortAll**(): `void`

abort all requests

#### Returns

`void`

#### Defined in

[packages/fe-utils/common/request/AbortPlugin.ts:79](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/AbortPlugin.ts#L79)

___

### onBefore

▸ **onBefore**(`config`): [`FetchRequestConfig`](../interfaces/common.FetchRequestConfig.md)

**has return value, not break the chain**

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`FetchRequestConfig`](../interfaces/common.FetchRequestConfig.md) |

#### Returns

[`FetchRequestConfig`](../interfaces/common.FetchRequestConfig.md)

**`Access`**

plugin

#### Implementation of

[ExecutorPlugin](common.ExecutorPlugin.md).[onBefore](common.ExecutorPlugin.md#onbefore)

#### Defined in

[packages/fe-utils/common/request/AbortPlugin.ts:14](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/AbortPlugin.ts#L14)

___

### onError

▸ **onError**(`error`, `config?`): `void` \| [`FetchRequestError`](common.FetchRequestError.md)

- if call `exec`, onError has return value or throw any error, exec will break the chain and throw error
- if call `execNoError`, onError has return value or throw any error, execNoError will return the error

**as long as it is captured by the error chain, the chain will be terminated**

#### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `Error` |
| `config?` | [`FetchRequestConfig`](../interfaces/common.FetchRequestConfig.md) |

#### Returns

`void` \| [`FetchRequestError`](common.FetchRequestError.md)

**`Access`**

plugin

#### Implementation of

[ExecutorPlugin](common.ExecutorPlugin.md).[onError](common.ExecutorPlugin.md#onerror)

#### Defined in

[packages/fe-utils/common/request/AbortPlugin.ts:30](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/AbortPlugin.ts#L30)
