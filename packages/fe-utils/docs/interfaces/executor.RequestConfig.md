[@qlover/fe-utils - v1.0.6](../README.md) / [executor](../modules/executor.md) / RequestConfig

# Interface: RequestConfig

[executor](../modules/executor.md).RequestConfig

Base request configuration interface
Extends RequestInit with additional properties for enhanced functionality

## Hierarchy

- `RequestInit`

  ↳ **`RequestConfig`**

  ↳↳ [`FetchRequestConfig`](executor.FetchRequestConfig.md)

## Indexable

▪ [key: `string`]: `unknown`

Additional configuration properties
Allows plugins to extend configuration with custom options

## Table of contents

### Properties

- [baseURL](executor.RequestConfig.md#baseurl)
- [executor](executor.RequestConfig.md#executor)
- [params](executor.RequestConfig.md#params)
- [timeout](executor.RequestConfig.md#timeout)
- [url](executor.RequestConfig.md#url)

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

#### Defined in

[packages/fe-utils/common/request/FetchRequestConfig.ts:41](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/FetchRequestConfig.ts#L41)

___

### executor

• `Optional` **executor**: [`AsyncExecutor`](../classes/executor.AsyncExecutor.md)

AsyncExecutor instance for request handling
Can be overridden when creating FetchRequest instance

**`Access`**

FetchRequest
Added by FetchRequest during initialization

#### Defined in

[packages/fe-utils/common/request/FetchRequestConfig.ts:17](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/FetchRequestConfig.ts#L17)

___

### params

• `Optional` **params**: `Record`\<`string`, `string`\>

URL query parameters
Will be serialized and appended to the URL

**`Access`**

FetchURLPlugin
Processed by FetchURLPlugin during request

#### Defined in

[packages/fe-utils/common/request/FetchRequestConfig.ts:61](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/FetchRequestConfig.ts#L61)

___

### timeout

• `Optional` **timeout**: `number`

Request timeout in milliseconds

**`Access`**

FetchRequest
Added by FetchRequest for timeout control

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

#### Defined in

[packages/fe-utils/common/request/FetchRequestConfig.ts:52](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/FetchRequestConfig.ts#L52)
