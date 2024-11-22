[@qlover/fe-utils - v1.0.6](../README.md) / [common](../modules/common.md) / ExecutorError

# Class: ExecutorError

[common](../modules/common.md).ExecutorError

## Hierarchy

- `Error`

  ↳ **`ExecutorError`**

  ↳↳ [`FetchRequestError`](common.FetchRequestError.md)

## Table of contents

### Constructors

- [constructor](common.ExecutorError.md#constructor)

### Properties

- [id](common.ExecutorError.md#id)

## Constructors

### constructor

• **new ExecutorError**(`id`, `originalError?`): [`ExecutorError`](common.ExecutorError.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |
| `originalError?` | `string` \| `Error` |

#### Returns

[`ExecutorError`](common.ExecutorError.md)

#### Overrides

Error.constructor

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:53](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/Executor.ts#L53)

## Properties

### id

• **id**: `string`

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:54](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/Executor.ts#L54)
