[@qlover/fe-utils - v1.0.6](../README.md) / [common](../modules/common.md) / FetchRequest

# Class: FetchRequest

[common](../modules/common.md).FetchRequest

predefined request config

## Hierarchy

- [`RequestExecutor`](common.RequestExecutor.md)\<[`FetchRequestConfig`](../interfaces/common.FetchRequestConfig.md)\>

  ↳ **`FetchRequest`**

## Table of contents

### Constructors

- [constructor](common.FetchRequest.md#constructor)

### Properties

- [executor](common.FetchRequest.md#executor)

### Methods

- [delete](common.FetchRequest.md#delete)
- [get](common.FetchRequest.md#get)
- [getConfig](common.FetchRequest.md#getconfig)
- [head](common.FetchRequest.md#head)
- [options](common.FetchRequest.md#options)
- [patch](common.FetchRequest.md#patch)
- [post](common.FetchRequest.md#post)
- [put](common.FetchRequest.md#put)
- [request](common.FetchRequest.md#request)

## Constructors

### constructor

• **new FetchRequest**(`config?`): [`FetchRequest`](common.FetchRequest.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | `Partial`\<[`FetchRequestConfig`](../interfaces/common.FetchRequestConfig.md)\> |

#### Returns

[`FetchRequest`](common.FetchRequest.md)

#### Overrides

[RequestExecutor](common.RequestExecutor.md).[constructor](common.RequestExecutor.md#constructor)

#### Defined in

[packages/fe-utils/common/request/FetchRequest.ts:21](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/FetchRequest.ts#L21)

## Properties

### executor

• `Readonly` **executor**: [`AsyncExecutor`](common.AsyncExecutor.md)

#### Inherited from

[RequestExecutor](common.RequestExecutor.md).[executor](common.RequestExecutor.md#executor)

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:19](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/RequestExecutor.ts#L19)

## Methods

### delete

▸ **delete**(`options`): `Promise`\<`unknown`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`FetchRequestConfig`](../interfaces/common.FetchRequestConfig.md) |

#### Returns

`Promise`\<`unknown`\>

#### Inherited from

[RequestExecutor](common.RequestExecutor.md).[delete](common.RequestExecutor.md#delete)

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:46](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/RequestExecutor.ts#L46)

___

### get

▸ **get**(`options`): `Promise`\<`unknown`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`FetchRequestConfig`](../interfaces/common.FetchRequestConfig.md) |

#### Returns

`Promise`\<`unknown`\>

#### Inherited from

[RequestExecutor](common.RequestExecutor.md).[get](common.RequestExecutor.md#get)

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:34](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/RequestExecutor.ts#L34)

___

### getConfig

▸ **getConfig**(): [`FetchRequestConfig`](../interfaces/common.FetchRequestConfig.md)

#### Returns

[`FetchRequestConfig`](../interfaces/common.FetchRequestConfig.md)

#### Inherited from

[RequestExecutor](common.RequestExecutor.md).[getConfig](common.RequestExecutor.md#getconfig)

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:22](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/RequestExecutor.ts#L22)

___

### head

▸ **head**(`options`): `Promise`\<`unknown`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`FetchRequestConfig`](../interfaces/common.FetchRequestConfig.md) |

#### Returns

`Promise`\<`unknown`\>

#### Inherited from

[RequestExecutor](common.RequestExecutor.md).[head](common.RequestExecutor.md#head)

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:54](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/RequestExecutor.ts#L54)

___

### options

▸ **options**(`options`): `Promise`\<`unknown`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`FetchRequestConfig`](../interfaces/common.FetchRequestConfig.md) |

#### Returns

`Promise`\<`unknown`\>

#### Inherited from

[RequestExecutor](common.RequestExecutor.md).[options](common.RequestExecutor.md#options)

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:58](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/RequestExecutor.ts#L58)

___

### patch

▸ **patch**(`options`): `Promise`\<`unknown`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`FetchRequestConfig`](../interfaces/common.FetchRequestConfig.md) |

#### Returns

`Promise`\<`unknown`\>

#### Inherited from

[RequestExecutor](common.RequestExecutor.md).[patch](common.RequestExecutor.md#patch)

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:50](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/RequestExecutor.ts#L50)

___

### post

▸ **post**(`options`): `Promise`\<`unknown`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`FetchRequestConfig`](../interfaces/common.FetchRequestConfig.md) |

#### Returns

`Promise`\<`unknown`\>

#### Inherited from

[RequestExecutor](common.RequestExecutor.md).[post](common.RequestExecutor.md#post)

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:38](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/RequestExecutor.ts#L38)

___

### put

▸ **put**(`options`): `Promise`\<`unknown`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`FetchRequestConfig`](../interfaces/common.FetchRequestConfig.md) |

#### Returns

`Promise`\<`unknown`\>

#### Inherited from

[RequestExecutor](common.RequestExecutor.md).[put](common.RequestExecutor.md#put)

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:42](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/RequestExecutor.ts#L42)

___

### request

▸ **request**(`config`): `Promise`\<`Response`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`FetchRequestConfig`](../interfaces/common.FetchRequestConfig.md) |

#### Returns

`Promise`\<`Response`\>

Response

#### Overrides

[RequestExecutor](common.RequestExecutor.md).[request](common.RequestExecutor.md#request)

#### Defined in

[packages/fe-utils/common/request/FetchRequest.ts:40](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/FetchRequest.ts#L40)
