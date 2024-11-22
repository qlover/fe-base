[@qlover/fe-utils - v1.0.6](../README.md) / [common](../modules/common.md) / RetryOptions

# Interface: RetryOptions

[common](../modules/common.md).RetryOptions

## Table of contents

### Properties

- [maxRetries](common.RetryOptions.md#maxretries)
- [retryDelay](common.RetryOptions.md#retrydelay)
- [shouldRetry](common.RetryOptions.md#shouldretry)
- [useExponentialBackoff](common.RetryOptions.md#useexponentialbackoff)

## Properties

### maxRetries

• **maxRetries**: `number`

max retries, from `0` start

**`Default`**

```ts
3
```

#### Defined in

[packages/fe-utils/common/executor/RetryPlugin.ts:8](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/RetryPlugin.ts#L8)

___

### retryDelay

• **retryDelay**: `number`

retry delay (ms)

**`Default`**

```ts
1000
```

#### Defined in

[packages/fe-utils/common/executor/RetryPlugin.ts:13](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/RetryPlugin.ts#L13)

___

### shouldRetry

• **shouldRetry**: (`error`: `Error`) => `boolean`

should retry function

**`Default`**

```ts
always retry
```

#### Type declaration

▸ (`error`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `Error` |

##### Returns

`boolean`

#### Defined in

[packages/fe-utils/common/executor/RetryPlugin.ts:23](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/RetryPlugin.ts#L23)

___

### useExponentialBackoff

• **useExponentialBackoff**: `boolean`

use exponential backoff

**`Default`**

```ts
false
```

#### Defined in

[packages/fe-utils/common/executor/RetryPlugin.ts:18](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/RetryPlugin.ts#L18)
