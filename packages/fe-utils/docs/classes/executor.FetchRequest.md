[@qlover/fe-utils - v1.0.6](../README.md) / [executor](../modules/executor.md) / FetchRequest

# Class: FetchRequest

[executor](../modules/executor.md).FetchRequest

Fetch-based implementation of RequestExecutor
Provides a robust HTTP client with plugin support

Features:
- Built on fetch API
- Automatic fetch detection and fallback
- Plugin support through AsyncExecutor
- Configurable request options
- Error handling with custom error types

**`Example`**

```typescript
// Basic usage
const client = new FetchRequest({
  baseURL: 'https://api.example.com'
});

// GET request with parameters
const users = await client.get({
  url: '/users',
  params: { role: 'admin' }
});

// POST request with body
const newUser = await client.post({
  url: '/users',
  body: JSON.stringify({ name: 'John' }),
  headers: { 'Content-Type': 'application/json' }
});
```

## Hierarchy

- [`RequestExecutor`](executor.RequestExecutor.md)\<[`FetchRequestConfig`](../interfaces/executor.FetchRequestConfig.md)\>

  ↳ **`FetchRequest`**

## Table of contents

### Constructors

- [constructor](executor.FetchRequest.md#constructor)

### Properties

- [executor](executor.FetchRequest.md#executor)

### Methods

- [delete](executor.FetchRequest.md#delete)
- [get](executor.FetchRequest.md#get)
- [getConfig](executor.FetchRequest.md#getconfig)
- [head](executor.FetchRequest.md#head)
- [options](executor.FetchRequest.md#options)
- [patch](executor.FetchRequest.md#patch)
- [post](executor.FetchRequest.md#post)
- [put](executor.FetchRequest.md#put)
- [request](executor.FetchRequest.md#request)

## Constructors

### constructor

• **new FetchRequest**(`config?`): [`FetchRequest`](executor.FetchRequest.md)

Creates a new FetchRequest instance
Automatically detects and configures fetch implementation

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | `Partial`\<[`FetchRequestConfig`](../interfaces/executor.FetchRequestConfig.md)\> | Request configuration options |

#### Returns

[`FetchRequest`](executor.FetchRequest.md)

**`Throws`**

When fetch is not available

#### Overrides

[RequestExecutor](executor.RequestExecutor.md).[constructor](executor.RequestExecutor.md#constructor)

#### Defined in

[packages/fe-utils/common/request/FetchRequest.ts:83](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/FetchRequest.ts#L83)

## Properties

### executor

• `Readonly` **executor**: [`AsyncExecutor`](executor.AsyncExecutor.md)

AsyncExecutor instance for request handling

#### Inherited from

[RequestExecutor](executor.RequestExecutor.md).[executor](executor.RequestExecutor.md#executor)

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:55](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/RequestExecutor.ts#L55)

## Methods

### delete

▸ **delete**(`options`): `Promise`\<`unknown`\>

Performs HTTP DELETE request

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`FetchRequestConfig`](../interfaces/executor.FetchRequestConfig.md) | Request configuration |

#### Returns

`Promise`\<`unknown`\>

Promise resolving to response data

#### Inherited from

[RequestExecutor](executor.RequestExecutor.md).[delete](executor.RequestExecutor.md#delete)

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:110](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/RequestExecutor.ts#L110)

___

### get

▸ **get**(`options`): `Promise`\<`unknown`\>

Performs HTTP GET request

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`FetchRequestConfig`](../interfaces/executor.FetchRequestConfig.md) | Request configuration |

#### Returns

`Promise`\<`unknown`\>

Promise resolving to response data

#### Inherited from

[RequestExecutor](executor.RequestExecutor.md).[get](executor.RequestExecutor.md#get)

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:83](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/RequestExecutor.ts#L83)

___

### getConfig

▸ **getConfig**(): [`FetchRequestConfig`](../interfaces/executor.FetchRequestConfig.md)

Returns the current request configuration

#### Returns

[`FetchRequestConfig`](../interfaces/executor.FetchRequestConfig.md)

Current configuration object

#### Inherited from

[RequestExecutor](executor.RequestExecutor.md).[getConfig](executor.RequestExecutor.md#getconfig)

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:62](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/RequestExecutor.ts#L62)

___

### head

▸ **head**(`options`): `Promise`\<`unknown`\>

Performs HTTP HEAD request

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`FetchRequestConfig`](../interfaces/executor.FetchRequestConfig.md) | Request configuration |

#### Returns

`Promise`\<`unknown`\>

Promise resolving to response data

#### Inherited from

[RequestExecutor](executor.RequestExecutor.md).[head](executor.RequestExecutor.md#head)

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:128](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/RequestExecutor.ts#L128)

___

### options

▸ **options**(`options`): `Promise`\<`unknown`\>

Performs HTTP OPTIONS request

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`FetchRequestConfig`](../interfaces/executor.FetchRequestConfig.md) | Request configuration |

#### Returns

`Promise`\<`unknown`\>

Promise resolving to response data

#### Inherited from

[RequestExecutor](executor.RequestExecutor.md).[options](executor.RequestExecutor.md#options)

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:137](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/RequestExecutor.ts#L137)

___

### patch

▸ **patch**(`options`): `Promise`\<`unknown`\>

Performs HTTP PATCH request

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`FetchRequestConfig`](../interfaces/executor.FetchRequestConfig.md) | Request configuration |

#### Returns

`Promise`\<`unknown`\>

Promise resolving to response data

#### Inherited from

[RequestExecutor](executor.RequestExecutor.md).[patch](executor.RequestExecutor.md#patch)

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:119](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/RequestExecutor.ts#L119)

___

### post

▸ **post**(`options`): `Promise`\<`unknown`\>

Performs HTTP POST request

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`FetchRequestConfig`](../interfaces/executor.FetchRequestConfig.md) | Request configuration |

#### Returns

`Promise`\<`unknown`\>

Promise resolving to response data

#### Inherited from

[RequestExecutor](executor.RequestExecutor.md).[post](executor.RequestExecutor.md#post)

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:92](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/RequestExecutor.ts#L92)

___

### put

▸ **put**(`options`): `Promise`\<`unknown`\>

Performs HTTP PUT request

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`FetchRequestConfig`](../interfaces/executor.FetchRequestConfig.md) | Request configuration |

#### Returns

`Promise`\<`unknown`\>

Promise resolving to response data

#### Inherited from

[RequestExecutor](executor.RequestExecutor.md).[put](executor.RequestExecutor.md#put)

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:101](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/RequestExecutor.ts#L101)

___

### request

▸ **request**(`config`): `Promise`\<`Response`\>

Core request implementation
Merges configurations and executes fetch request

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | [`FetchRequestConfig`](../interfaces/executor.FetchRequestConfig.md) | Request configuration |

#### Returns

`Promise`\<`Response`\>

Promise resolving to Response object

**`Throws`**

When fetcher is not available

#### Overrides

[RequestExecutor](executor.RequestExecutor.md).[request](executor.RequestExecutor.md#request)

#### Defined in

[packages/fe-utils/common/request/FetchRequest.ts:107](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/FetchRequest.ts#L107)
