[@qlover/fe-utils - v1.0.6](../README.md) / [executor](../modules/executor.md) / AbortPlugin

# Class: AbortPlugin

[executor](../modules/executor.md).AbortPlugin

Plugin for handling request cancellation
Provides abort functionality for fetch requests

Features:
- Request cancellation support
- Automatic cleanup of aborted requests
- Multiple concurrent request handling
- Custom abort callbacks

**`Implements`**

**`Example`**

```typescript
// Basic usage
const abortPlugin = new AbortPlugin();
const client = new FetchRequest();
client.executor.use(abortPlugin);

// Abort specific request
const config = { url: '/api/data' };
abortPlugin.abort(config);

// Abort all pending requests
abortPlugin.abortAll();
```

## Implements

- [`ExecutorPlugin`](executor.ExecutorPlugin.md)

## Table of contents

### Constructors

- [constructor](executor.AbortPlugin.md#constructor)

### Methods

- [abort](executor.AbortPlugin.md#abort)
- [abortAll](executor.AbortPlugin.md#abortall)
- [onBefore](executor.AbortPlugin.md#onbefore)
- [onError](executor.AbortPlugin.md#onerror)

## Constructors

### constructor

• **new AbortPlugin**(): [`AbortPlugin`](executor.AbortPlugin.md)

#### Returns

[`AbortPlugin`](executor.AbortPlugin.md)

## Methods

### abort

▸ **abort**(`config`): `void`

Aborts a specific request
Triggers abort callback if provided

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | [`FetchRequestConfig`](../interfaces/executor.FetchRequestConfig.md) | Configuration of request to abort |

#### Returns

`void`

**`Example`**

```typescript
abortPlugin.abort({
  url: '/api/data',
  onAbort: (config) => {
    console.log('Request aborted:', config.url);
  }
});
```

#### Defined in

[packages/fe-utils/common/request/AbortPlugin.ts:127](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/AbortPlugin.ts#L127)

___

### abortAll

▸ **abortAll**(): `void`

Aborts all pending requests
Clears all stored controllers

#### Returns

`void`

**`Example`**

```typescript
// Cancel all requests when component unmounts
useEffect(() => {
  return () => abortPlugin.abortAll();
}, []);
```

#### Defined in

[packages/fe-utils/common/request/AbortPlugin.ts:154](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/AbortPlugin.ts#L154)

___

### onBefore

▸ **onBefore**(`config`): [`FetchRequestConfig`](../interfaces/executor.FetchRequestConfig.md)

Pre-request hook that sets up abort handling
Creates new AbortController and cancels any existing request with same key

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | [`FetchRequestConfig`](../interfaces/executor.FetchRequestConfig.md) | Request configuration |

#### Returns

[`FetchRequestConfig`](../interfaces/executor.FetchRequestConfig.md)

Modified configuration with abort control

#### Implementation of

[ExecutorPlugin](executor.ExecutorPlugin.md).[onBefore](executor.ExecutorPlugin.md#onbefore)

#### Defined in

[packages/fe-utils/common/request/AbortPlugin.ts:59](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/AbortPlugin.ts#L59)

___

### onError

▸ **onError**(`error`, `config?`): `void` \| [`FetchRequestError`](executor.FetchRequestError.md)

Error handling hook for abort scenarios
Processes different types of abort errors and cleans up resources

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `error` | `Error` | Original error |
| `config?` | [`FetchRequestConfig`](../interfaces/executor.FetchRequestConfig.md) | Request configuration |

#### Returns

`void` \| [`FetchRequestError`](executor.FetchRequestError.md)

FetchRequestError or void

#### Implementation of

[ExecutorPlugin](executor.ExecutorPlugin.md).[onError](executor.ExecutorPlugin.md#onerror)

#### Defined in

[packages/fe-utils/common/request/AbortPlugin.ts:83](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/AbortPlugin.ts#L83)
