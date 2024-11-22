[@qlover/fe-utils - v1.0.6](../README.md) / [executor](../modules/executor.md) / RequestExecutor

# Class: RequestExecutor\<Cfg\>

[executor](../modules/executor.md).RequestExecutor

Base request executor class that provides HTTP request functionality
Built on top of AsyncExecutor for plugin support and error handling

Features:
- Supports all standard HTTP methods
- Plugin-based request modification
- Configurable request options
- Type-safe request configuration

**`Example`**

```typescript
// Basic usage
const executor = new RequestExecutor(config, new AsyncExecutor());

// GET request
const data = await executor.get({
  url: '/api/users',
  params: { id: 123 }
});

// POST request with body
const result = await executor.post({
  url: '/api/users',
  body: JSON.stringify({ name: 'John' })
});
```

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `Cfg` | extends [`RequestConfig`](../interfaces/executor.RequestConfig.md) | Type of request configuration |

## Hierarchy

- **`RequestExecutor`**

  ↳ [`FetchRequest`](executor.FetchRequest.md)

## Table of contents

### Constructors

- [constructor](executor.RequestExecutor.md#constructor)

### Properties

- [executor](executor.RequestExecutor.md#executor)

### Methods

- [delete](executor.RequestExecutor.md#delete)
- [get](executor.RequestExecutor.md#get)
- [getConfig](executor.RequestExecutor.md#getconfig)
- [head](executor.RequestExecutor.md#head)
- [options](executor.RequestExecutor.md#options)
- [patch](executor.RequestExecutor.md#patch)
- [post](executor.RequestExecutor.md#post)
- [put](executor.RequestExecutor.md#put)
- [request](executor.RequestExecutor.md#request)

## Constructors

### constructor

• **new RequestExecutor**\<`Cfg`\>(`config`, `executor`): [`RequestExecutor`](executor.RequestExecutor.md)\<`Cfg`\>

Creates a new RequestExecutor instance

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Cfg` | extends [`RequestConfig`](../interfaces/executor.RequestConfig.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | `Cfg` | Base request configuration |
| `executor` | [`AsyncExecutor`](executor.AsyncExecutor.md) | AsyncExecutor instance for request handling |

#### Returns

[`RequestExecutor`](executor.RequestExecutor.md)\<`Cfg`\>

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:53](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/RequestExecutor.ts#L53)

## Properties

### executor

• `Readonly` **executor**: [`AsyncExecutor`](executor.AsyncExecutor.md)

AsyncExecutor instance for request handling

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:55](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/RequestExecutor.ts#L55)

## Methods

### delete

▸ **delete**(`options`): `Promise`\<`unknown`\>

Performs HTTP DELETE request

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | `Cfg` | Request configuration |

#### Returns

`Promise`\<`unknown`\>

Promise resolving to response data

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:110](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/RequestExecutor.ts#L110)

___

### get

▸ **get**(`options`): `Promise`\<`unknown`\>

Performs HTTP GET request

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | `Cfg` | Request configuration |

#### Returns

`Promise`\<`unknown`\>

Promise resolving to response data

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:83](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/RequestExecutor.ts#L83)

___

### getConfig

▸ **getConfig**(): `Cfg`

Returns the current request configuration

#### Returns

`Cfg`

Current configuration object

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:62](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/RequestExecutor.ts#L62)

___

### head

▸ **head**(`options`): `Promise`\<`unknown`\>

Performs HTTP HEAD request

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | `Cfg` | Request configuration |

#### Returns

`Promise`\<`unknown`\>

Promise resolving to response data

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:128](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/RequestExecutor.ts#L128)

___

### options

▸ **options**(`options`): `Promise`\<`unknown`\>

Performs HTTP OPTIONS request

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | `Cfg` | Request configuration |

#### Returns

`Promise`\<`unknown`\>

Promise resolving to response data

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:137](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/RequestExecutor.ts#L137)

___

### patch

▸ **patch**(`options`): `Promise`\<`unknown`\>

Performs HTTP PATCH request

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | `Cfg` | Request configuration |

#### Returns

`Promise`\<`unknown`\>

Promise resolving to response data

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:119](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/RequestExecutor.ts#L119)

___

### post

▸ **post**(`options`): `Promise`\<`unknown`\>

Performs HTTP POST request

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | `Cfg` | Request configuration |

#### Returns

`Promise`\<`unknown`\>

Promise resolving to response data

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:92](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/RequestExecutor.ts#L92)

___

### put

▸ **put**(`options`): `Promise`\<`unknown`\>

Performs HTTP PUT request

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | `Cfg` | Request configuration |

#### Returns

`Promise`\<`unknown`\>

Promise resolving to response data

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:101](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/RequestExecutor.ts#L101)

___

### request

▸ **request**(`config`): `Promise`\<`unknown`\>

Core request method that handles all HTTP requests
Should be implemented by concrete classes

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | `Cfg` | Request configuration |

#### Returns

`Promise`\<`unknown`\>

Promise resolving to response data

**`Throws`**

When not implemented

#### Defined in

[packages/fe-utils/common/request/RequestExecutor.ts:74](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/RequestExecutor.ts#L74)
