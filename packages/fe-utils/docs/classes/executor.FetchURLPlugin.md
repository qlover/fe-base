[@qlover/fe-utils - v1.0.6](../README.md) / [executor](../modules/executor.md) / FetchURLPlugin

# Class: FetchURLPlugin

[executor](../modules/executor.md).FetchURLPlugin

Plugin for URL manipulation and response handling
Provides URL composition and response status checking

Features:
- URL normalization
- Base URL handling
- Query parameter management
- Response status validation

**`Implements`**

**`Example`**

```typescript
// Basic usage
const urlPlugin = new FetchURLPlugin();
const client = new FetchRequest();
client.executor.use(urlPlugin);

// Request with base URL and params
await client.get({
  baseURL: 'https://api.example.com',
  url: '/users',
  params: { role: 'admin' }
});
```

## Implements

- [`ExecutorPlugin`](executor.ExecutorPlugin.md)

## Table of contents

### Constructors

- [constructor](executor.FetchURLPlugin.md#constructor)

### Methods

- [appendQueryParams](executor.FetchURLPlugin.md#appendqueryparams)
- [buildUrl](executor.FetchURLPlugin.md#buildurl)
- [connectBaseURL](executor.FetchURLPlugin.md#connectbaseurl)
- [isFullURL](executor.FetchURLPlugin.md#isfullurl)
- [onBefore](executor.FetchURLPlugin.md#onbefore)
- [onError](executor.FetchURLPlugin.md#onerror)
- [onSuccess](executor.FetchURLPlugin.md#onsuccess)

## Constructors

### constructor

• **new FetchURLPlugin**(): [`FetchURLPlugin`](executor.FetchURLPlugin.md)

#### Returns

[`FetchURLPlugin`](executor.FetchURLPlugin.md)

## Methods

### appendQueryParams

▸ **appendQueryParams**(`url`, `params?`): `string`

Appends query parameters to URL
Handles existing query parameters in URL

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `url` | `string` | Base URL |
| `params` | `Record`\<`string`, `string`\> | Parameters to append |

#### Returns

`string`

URL with query parameters

**`Example`**

```typescript
const url = plugin.appendQueryParams(
  'https://api.example.com/users',
  { role: 'admin', status: 'active' }
);
// => https://api.example.com/users?role=admin&status=active
```

#### Defined in

[packages/fe-utils/common/request/FetchURLPlugin.ts:60](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/FetchURLPlugin.ts#L60)

___

### buildUrl

▸ **buildUrl**(`config`): `string`

Builds complete URL from configuration
Handles base URL, path normalization, and query parameters

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | [`FetchRequestConfig`](../interfaces/executor.FetchRequestConfig.md) | Request configuration |

#### Returns

`string`

Complete URL

#### Defined in

[packages/fe-utils/common/request/FetchURLPlugin.ts:98](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/FetchURLPlugin.ts#L98)

___

### connectBaseURL

▸ **connectBaseURL**(`url`, `baseURL`): `string`

Combines base URL with path
Ensures proper slash handling

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `url` | `string` | URL path |
| `baseURL` | `string` | Base URL |

#### Returns

`string`

Combined URL

#### Defined in

[packages/fe-utils/common/request/FetchURLPlugin.ts:87](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/FetchURLPlugin.ts#L87)

___

### isFullURL

▸ **isFullURL**(`url`): `boolean`

Checks if URL is absolute (starts with http:// or https://)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `url` | `string` | URL to check |

#### Returns

`boolean`

Boolean indicating if URL is absolute

#### Defined in

[packages/fe-utils/common/request/FetchURLPlugin.ts:39](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/FetchURLPlugin.ts#L39)

___

### onBefore

▸ **onBefore**(`config`): `void`

Pre-request hook that builds complete URL

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | [`FetchRequestConfig`](../interfaces/executor.FetchRequestConfig.md) | Request configuration |

#### Returns

`void`

#### Implementation of

[ExecutorPlugin](executor.ExecutorPlugin.md).[onBefore](executor.ExecutorPlugin.md#onbefore)

#### Defined in

[packages/fe-utils/common/request/FetchURLPlugin.ts:124](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/FetchURLPlugin.ts#L124)

___

### onError

▸ **onError**(`error`): [`FetchRequestError`](executor.FetchRequestError.md)

Error handling hook
Wraps non-FetchRequestError errors

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `error` | `Error` | Original error |

#### Returns

[`FetchRequestError`](executor.FetchRequestError.md)

FetchRequestError

#### Implementation of

[ExecutorPlugin](executor.ExecutorPlugin.md).[onError](executor.ExecutorPlugin.md#onerror)

#### Defined in

[packages/fe-utils/common/request/FetchURLPlugin.ts:160](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/FetchURLPlugin.ts#L160)

___

### onSuccess

▸ **onSuccess**(`result`): `Response`

Success hook that validates response status
Throws error for non-OK responses

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `result` | `Response` | Fetch response |

#### Returns

`Response`

Response if OK

**`Throws`**

If response is not OK

#### Implementation of

[ExecutorPlugin](executor.ExecutorPlugin.md).[onSuccess](executor.ExecutorPlugin.md#onsuccess)

#### Defined in

[packages/fe-utils/common/request/FetchURLPlugin.ts:137](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/FetchURLPlugin.ts#L137)
