[@qlover/fe-utils - v1.0.6](../README.md) / [common](../modules/common.md) / FetchRequestConfig

# Interface: FetchRequestConfig

[common](../modules/common.md).FetchRequestConfig

## Hierarchy

- [`RequestConfig`](common.RequestConfig.md)

  ↳ **`FetchRequestConfig`**

## Table of contents

### Properties

- [baseURL](common.FetchRequestConfig.md#baseurl)
- [controller](common.FetchRequestConfig.md#controller)
- [executor](common.FetchRequestConfig.md#executor)
- [fetcher](common.FetchRequestConfig.md#fetcher)
- [onAbort](common.FetchRequestConfig.md#onabort)
- [params](common.FetchRequestConfig.md#params)
- [signal](common.FetchRequestConfig.md#signal)
- [timeout](common.FetchRequestConfig.md#timeout)
- [url](common.FetchRequestConfig.md#url)

## Properties

### baseURL

• `Optional` **baseURL**: `string`

Base URL

**`Example`**

```ts
https://api.example.com
```

**`Access`**

FetchURLPlugin

- url = /users/1 => https://api.example.com/users/1
- url = users/1 => https://api.example.com/users/1

#### Inherited from

[RequestConfig](common.RequestConfig.md).[baseURL](common.RequestConfig.md#baseurl)

#### Defined in

[packages/fe-utils/common/request/FetchRequestConfig.ts:25](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/FetchRequestConfig.ts#L25)

___

### controller

• `Optional` **controller**: `AbortController`

**`Access`**

AbortPlugin
AbortController

#### Defined in

[packages/fe-utils/common/request/FetchRequestConfig.ts:61](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/FetchRequestConfig.ts#L61)

___

### executor

• `Optional` **executor**: [`AsyncExecutor`](../classes/common.AsyncExecutor.md)

Base executor config, it's only AsyncExecutor

can override by FetchRequest

**`Access`**

FetchRequest

#### Inherited from

[RequestConfig](common.RequestConfig.md).[executor](common.RequestConfig.md#executor)

#### Defined in

[packages/fe-utils/common/request/FetchRequestConfig.ts:10](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/FetchRequestConfig.ts#L10)

___

### fetcher

• `Optional` **fetcher**: (`input`: `URL` \| `RequestInfo`, `init?`: `RequestInit`) => `Promise`\<`Response`\>(`input`: `string` \| `URL` \| `Request`, `init?`: `RequestInit`) => `Promise`\<`Response`\>

Only use FetchRequest, can overried call send request

**`Access`**

FetchRequest

#### Type declaration

▸ (`input`, `init?`): `Promise`\<`Response`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `URL` \| `RequestInfo` |
| `init?` | `RequestInit` |

##### Returns

`Promise`\<`Response`\>

▸ (`input`, `init?`): `Promise`\<`Response`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `string` \| `URL` \| `Request` |
| `init?` | `RequestInit` |

##### Returns

`Promise`\<`Response`\>

#### Defined in

[packages/fe-utils/common/request/FetchRequestConfig.ts:49](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/FetchRequestConfig.ts#L49)

___

### onAbort

• `Optional` **onAbort**: (`config`: [`FetchRequestConfig`](common.FetchRequestConfig.md)) => `void`

**`Access`**

AbortPlugin
AbortHandler

#### Type declaration

▸ (`config`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`FetchRequestConfig`](common.FetchRequestConfig.md) |

##### Returns

`void`

#### Defined in

[packages/fe-utils/common/request/FetchRequestConfig.ts:67](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/FetchRequestConfig.ts#L67)

___

### params

• `Optional` **params**: `Record`\<`string`, `string`\>

**`Access`**

FetchURLPlugin

#### Inherited from

[RequestConfig](common.RequestConfig.md).[params](common.RequestConfig.md#params)

#### Defined in

[packages/fe-utils/common/request/FetchRequestConfig.ts:36](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/FetchRequestConfig.ts#L36)

___

### signal

• `Optional` **signal**: `AbortSignal`

**`Access`**

AbortPlugin
AbortController signal

#### Overrides

RequestConfig.signal

#### Defined in

[packages/fe-utils/common/request/FetchRequestConfig.ts:55](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/FetchRequestConfig.ts#L55)

___

### timeout

• `Optional` **timeout**: `number`

**`Access`**

FetchRequest

#### Inherited from

[RequestConfig](common.RequestConfig.md).[timeout](common.RequestConfig.md#timeout)

#### Defined in

[packages/fe-utils/common/request/FetchRequestConfig.ts:15](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/FetchRequestConfig.ts#L15)

___

### url

• **url**: `string`

**`Access`**

FetchURLPlugin
FIXME: change to URL | Request, add attribute `input`

#### Inherited from

[RequestConfig](common.RequestConfig.md).[url](common.RequestConfig.md#url)

#### Defined in

[packages/fe-utils/common/request/FetchRequestConfig.ts:31](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/FetchRequestConfig.ts#L31)
