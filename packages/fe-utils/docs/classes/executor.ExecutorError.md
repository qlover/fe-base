[@qlover/fe-utils - v1.0.6](../README.md) / [executor](../modules/executor.md) / ExecutorError

# Class: ExecutorError

[executor](../modules/executor.md).ExecutorError

Custom error class for executor operations
Provides structured error handling with error identification

## Hierarchy

- `Error`

  ↳ **`ExecutorError`**

  ↳↳ [`FetchRequestError`](executor.FetchRequestError.md)

## Table of contents

### Constructors

- [constructor](executor.ExecutorError.md#constructor)

### Properties

- [id](executor.ExecutorError.md#id)

## Constructors

### constructor

• **new ExecutorError**(`id`, `originalError?`): [`ExecutorError`](executor.ExecutorError.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |
| `originalError?` | `string` \| `Error` |

#### Returns

[`ExecutorError`](executor.ExecutorError.md)

#### Overrides

Error.constructor

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:133](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/Executor.ts#L133)

## Properties

### id

• **id**: `string`

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:134](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/Executor.ts#L134)
