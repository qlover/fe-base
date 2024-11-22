[@qlover/fe-utils - v1.0.6](../README.md) / [common](../modules/common.md) / FetchURLPlugin

# Class: FetchURLPlugin

[common](../modules/common.md).FetchURLPlugin

## Implements

- [`ExecutorPlugin`](common.ExecutorPlugin.md)

## Table of contents

### Constructors

- [constructor](common.FetchURLPlugin.md#constructor)

### Methods

- [appendQueryParams](common.FetchURLPlugin.md#appendqueryparams)
- [buildUrl](common.FetchURLPlugin.md#buildurl)
- [connectBaseURL](common.FetchURLPlugin.md#connectbaseurl)
- [isFullURL](common.FetchURLPlugin.md#isfullurl)
- [onBefore](common.FetchURLPlugin.md#onbefore)
- [onError](common.FetchURLPlugin.md#onerror)
- [onSuccess](common.FetchURLPlugin.md#onsuccess)

## Constructors

### constructor

• **new FetchURLPlugin**(): [`FetchURLPlugin`](common.FetchURLPlugin.md)

#### Returns

[`FetchURLPlugin`](common.FetchURLPlugin.md)

## Methods

### appendQueryParams

▸ **appendQueryParams**(`url`, `params?`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `url` | `string` |
| `params` | `Record`\<`string`, `string`\> |

#### Returns

`string`

#### Defined in

[packages/fe-utils/common/request/FetchURLPlugin.ts:10](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/FetchURLPlugin.ts#L10)

___

### buildUrl

▸ **buildUrl**(`config`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`FetchRequestConfig`](../interfaces/common.FetchRequestConfig.md) |

#### Returns

`string`

#### Defined in

[packages/fe-utils/common/request/FetchURLPlugin.ts:33](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/FetchURLPlugin.ts#L33)

___

### connectBaseURL

▸ **connectBaseURL**(`url`, `baseURL`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `url` | `string` |
| `baseURL` | `string` |

#### Returns

`string`

#### Defined in

[packages/fe-utils/common/request/FetchURLPlugin.ts:29](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/FetchURLPlugin.ts#L29)

___

### isFullURL

▸ **isFullURL**(`url`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `url` | `string` |

#### Returns

`boolean`

#### Defined in

[packages/fe-utils/common/request/FetchURLPlugin.ts:6](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/FetchURLPlugin.ts#L6)

___

### onBefore

▸ **onBefore**(`config`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`FetchRequestConfig`](../interfaces/common.FetchRequestConfig.md) |

#### Returns

`void`

#### Implementation of

[ExecutorPlugin](common.ExecutorPlugin.md).[onBefore](common.ExecutorPlugin.md#onbefore)

#### Defined in

[packages/fe-utils/common/request/FetchURLPlugin.ts:57](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/FetchURLPlugin.ts#L57)

___

### onError

▸ **onError**(`error`): [`FetchRequestError`](common.FetchRequestError.md)

- if call `exec`, onError has return value or throw any error, exec will break the chain and throw error
- if call `execNoError`, onError has return value or throw any error, execNoError will return the error

**as long as it is captured by the error chain, the chain will be terminated**

#### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `Error` |

#### Returns

[`FetchRequestError`](common.FetchRequestError.md)

**`Access`**

plugin

#### Implementation of

[ExecutorPlugin](common.ExecutorPlugin.md).[onError](common.ExecutorPlugin.md#onerror)

#### Defined in

[packages/fe-utils/common/request/FetchURLPlugin.ts:78](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/FetchURLPlugin.ts#L78)

___

### onSuccess

▸ **onSuccess**(`result`): `Response`

#### Parameters

| Name | Type |
| :------ | :------ |
| `result` | `Response` |

#### Returns

`Response`

**`Access`**

plugin
**has return value, break the chain**

#### Implementation of

[ExecutorPlugin](common.ExecutorPlugin.md).[onSuccess](common.ExecutorPlugin.md#onsuccess)

#### Defined in

[packages/fe-utils/common/request/FetchURLPlugin.ts:62](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/FetchURLPlugin.ts#L62)
