[@qlover/fe-utils - v1.0.6](../README.md) / [executor](../modules/executor.md) / RetryOptions

# Interface: RetryOptions

[executor](../modules/executor.md).RetryOptions

Configuration options for the RetryPlugin
 RetryOptions

## Table of contents

### Properties

- [maxRetries](executor.RetryOptions.md#maxretries)
- [retryDelay](executor.RetryOptions.md#retrydelay)
- [shouldRetry](executor.RetryOptions.md#shouldretry)
- [useExponentialBackoff](executor.RetryOptions.md#useexponentialbackoff)

## Properties

### maxRetries

• **maxRetries**: `number`

Maximum number of retry attempts (starting from 0)
Will be clamped between 1 and SAFE_MAX_RETRIES (16)

**`Default`**

```ts
3
```

#### Defined in

[packages/fe-utils/common/executor/RetryPlugin.ts:13](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/RetryPlugin.ts#L13)

___

### retryDelay

• **retryDelay**: `number`

Base delay between retry attempts in milliseconds
Used directly for fixed delay, or as base for exponential backoff

**`Default`**

```ts
1000
```

#### Defined in

[packages/fe-utils/common/executor/RetryPlugin.ts:20](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/RetryPlugin.ts#L20)

___

### shouldRetry

• **shouldRetry**: (`error`: `Error`) => `boolean`

Custom function to determine if a retry should be attempted

**`Default`**

```ts
() => true (always retry)
```

#### Type declaration

▸ (`error`): `boolean`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `error` | `Error` | The error that caused the failure |

##### Returns

`boolean`

#### Defined in

[packages/fe-utils/common/executor/RetryPlugin.ts:35](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/RetryPlugin.ts#L35)

___

### useExponentialBackoff

• **useExponentialBackoff**: `boolean`

When true, implements exponential backoff delay strategy
Delay formula: retryDelay * (2 ^ attemptNumber)

**`Default`**

```ts
false
```

#### Defined in

[packages/fe-utils/common/executor/RetryPlugin.ts:27](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/RetryPlugin.ts#L27)
