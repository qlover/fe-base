[@qlover/fe-utils - v1.0.6](../README.md) / [executor](../modules/executor.md) / FetchRequestConfig

# Interface: FetchRequestConfig

[executor](../modules/executor.md).FetchRequestConfig

Extended configuration interface for FetchRequest
Adds fetch-specific options and abort control

## Hierarchy

- [`RequestConfig`](executor.RequestConfig.md)

  ↳ **`FetchRequestConfig`**

## Table of contents

### Properties

- [baseURL](executor.FetchRequestConfig.md#baseurl)
- [controller](executor.FetchRequestConfig.md#controller)
- [executor](executor.FetchRequestConfig.md#executor)
- [fetcher](executor.FetchRequestConfig.md#fetcher)
- [onAbort](executor.FetchRequestConfig.md#onabort)
- [params](executor.FetchRequestConfig.md#params)
- [signal](executor.FetchRequestConfig.md#signal)
- [timeout](executor.FetchRequestConfig.md#timeout)
- [url](executor.FetchRequestConfig.md#url)

## Properties

### baseURL

• `Optional` **baseURL**: `string`

Base URL for all requests
Will be prepended to the request URL

**`Access`**

FetchURLPlugin
Processed by FetchURLPlugin during request

**`Example`**

```typescript
baseURL: 'https://api.example.com'
// url = /users/1 => https://api.example.com/users/1
// url = users/1 => https://api.example.com/users/1
```

#### Inherited from

[RequestConfig](executor.RequestConfig.md).[baseURL](executor.RequestConfig.md#baseurl)

#### Defined in

[packages/fe-utils/common/request/FetchRequestConfig.ts:41](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/FetchRequestConfig.ts#L41)

___

### controller

• `Optional` **controller**: `AbortController`

AbortController instance

**`Access`**

AbortPlugin
Added by AbortPlugin for request cancellation control

#### Defined in

[packages/fe-utils/common/request/FetchRequestConfig.ts:100](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/FetchRequestConfig.ts#L100)

___

### executor

• `Optional` **executor**: [`AsyncExecutor`](../classes/executor.AsyncExecutor.md)

AsyncExecutor instance for request handling
Can be overridden when creating FetchRequest instance

**`Access`**

FetchRequest
Added by FetchRequest during initialization

#### Inherited from

[RequestConfig](executor.RequestConfig.md).[executor](executor.RequestConfig.md#executor)

#### Defined in

[packages/fe-utils/common/request/FetchRequestConfig.ts:17](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/FetchRequestConfig.ts#L17)

___

### fetcher

• `Optional` **fetcher**: (`input`: `URL` \| `RequestInfo`, `init?`: `RequestInit`) => `Promise`\<`Response`\>(`input`: `string` \| `URL` \| `Request`, `init?`: `RequestInit`) => `Promise`\<`Response`\>

Custom fetch implementation
Allows overriding the default fetch function

**`Access`**

FetchRequest
Used by FetchRequest to make HTTP requests

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

[packages/fe-utils/common/request/FetchRequestConfig.ts:84](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/FetchRequestConfig.ts#L84)

___

### onAbort

• `Optional` **onAbort**: (`config`: [`FetchRequestConfig`](executor.FetchRequestConfig.md)) => `void`

Callback function for abort events

**`Access`**

AbortPlugin
Called by AbortPlugin when request is cancelled

#### Type declaration

▸ (`config`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`FetchRequestConfig`](executor.FetchRequestConfig.md) |

##### Returns

`void`

#### Defined in

[packages/fe-utils/common/request/FetchRequestConfig.ts:108](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/FetchRequestConfig.ts#L108)

___

### params

• `Optional` **params**: `Record`\<`string`, `string`\>

URL query parameters
Will be serialized and appended to the URL

**`Access`**

FetchURLPlugin
Processed by FetchURLPlugin during request

#### Inherited from

[RequestConfig](executor.RequestConfig.md).[params](executor.RequestConfig.md#params)

#### Defined in

[packages/fe-utils/common/request/FetchRequestConfig.ts:61](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/FetchRequestConfig.ts#L61)

___

### signal

• `Optional` **signal**: `AbortSignal`

AbortSignal for request cancellation

**`Access`**

AbortPlugin
Added by AbortPlugin for request cancellation support

#### Overrides

RequestConfig.signal

#### Defined in

[packages/fe-utils/common/request/FetchRequestConfig.ts:92](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/FetchRequestConfig.ts#L92)

___

### timeout

• `Optional` **timeout**: `number`

Request timeout in milliseconds

**`Access`**

FetchRequest
Added by FetchRequest for timeout control

#### Inherited from

[RequestConfig](executor.RequestConfig.md).[timeout](executor.RequestConfig.md#timeout)

#### Defined in

[packages/fe-utils/common/request/FetchRequestConfig.ts:25](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/FetchRequestConfig.ts#L25)

___

### url

• **url**: `string`

Request URL path
Will be combined with baseURL if provided

**`Access`**

FetchURLPlugin
Processed by FetchURLPlugin during request

**`Todo`**

Change to URL | Request, add attribute `input`

#### Inherited from

[RequestConfig](executor.RequestConfig.md).[url](executor.RequestConfig.md#url)

#### Defined in

[packages/fe-utils/common/request/FetchRequestConfig.ts:52](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/FetchRequestConfig.ts#L52)
