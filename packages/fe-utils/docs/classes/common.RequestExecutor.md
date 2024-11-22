[@qlover/fe-utils - v1.0.6](../README.md) / [common](../modules/common.md) / RequestExecutor

# Class: RequestExecutor\<Cfg\>

[common](../modules/common.md).RequestExecutor

predefined request config

## Type parameters

| Name | Type |
| :------ | :------ |
| `Cfg` | extends [`RequestConfig`](../interfaces/common.RequestConfig.md) |

## Hierarchy

- **`RequestExecutor`**

  ↳ [`FetchRequest`](common.FetchRequest.md)

## Table of contents

### Constructors

- [constructor](common.RequestExecutor.md#constructor)

### Properties

- [executor](common.RequestExecutor.md#executor)

### Methods

- [delete](common.RequestExecutor.md#delete)
- [get](common.RequestExecutor.md#get)
- [getConfig](common.RequestExecutor.md#getconfig)
- [head](common.RequestExecutor.md#head)
- [options](common.RequestExecutor.md#options)
- [patch](common.RequestExecutor.md#patch)
- [post](common.RequestExecutor.md#post)
- [put](common.RequestExecutor.md#put)
- [request](common.RequestExecutor.md#request)

## Constructors

### constructor

• **new RequestExecutor**\<`Cfg`\>(`config`, `executor`): [`RequestExecutor`](common.RequestExecutor.md)\<`Cfg`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Cfg` | extends [`RequestConfig`](../interfaces/common.RequestConfig.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | `Cfg` |
| `executor` | [`AsyncExecutor`](common.AsyncExecutor.md) |

#### Returns

[`RequestExecutor`](common.RequestExecutor.md)\<`Cfg`\>

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:17](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/RequestExecutor.ts#L17)

## Properties

### executor

• `Readonly` **executor**: [`AsyncExecutor`](common.AsyncExecutor.md)

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:19](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/RequestExecutor.ts#L19)

## Methods

### delete

▸ **delete**(`options`): `Promise`\<`unknown`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `Cfg` |

#### Returns

`Promise`\<`unknown`\>

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:46](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/RequestExecutor.ts#L46)

___

### get

▸ **get**(`options`): `Promise`\<`unknown`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `Cfg` |

#### Returns

`Promise`\<`unknown`\>

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:34](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/RequestExecutor.ts#L34)

___

### getConfig

▸ **getConfig**(): `Cfg`

#### Returns

`Cfg`

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:22](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/RequestExecutor.ts#L22)

___

### head

▸ **head**(`options`): `Promise`\<`unknown`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `Cfg` |

#### Returns

`Promise`\<`unknown`\>

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:54](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/RequestExecutor.ts#L54)

___

### options

▸ **options**(`options`): `Promise`\<`unknown`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `Cfg` |

#### Returns

`Promise`\<`unknown`\>

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:58](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/RequestExecutor.ts#L58)

___

### patch

▸ **patch**(`options`): `Promise`\<`unknown`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `Cfg` |

#### Returns

`Promise`\<`unknown`\>

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:50](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/RequestExecutor.ts#L50)

___

### post

▸ **post**(`options`): `Promise`\<`unknown`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `Cfg` |

#### Returns

`Promise`\<`unknown`\>

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:38](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/RequestExecutor.ts#L38)

___

### put

▸ **put**(`options`): `Promise`\<`unknown`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `Cfg` |

#### Returns

`Promise`\<`unknown`\>

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:42](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/RequestExecutor.ts#L42)

___

### request

▸ **request**(`config`): `Promise`\<`unknown`\>

allow any response type

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | `Cfg` |

#### Returns

`Promise`\<`unknown`\>

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:30](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/RequestExecutor.ts#L30)
