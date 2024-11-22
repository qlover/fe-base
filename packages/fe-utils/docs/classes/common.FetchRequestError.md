[@qlover/fe-utils - v1.0.6](../README.md) / [common](../modules/common.md) / FetchRequestError

# Class: FetchRequestError

[common](../modules/common.md).FetchRequestError

## Hierarchy

- [`ExecutorError`](common.ExecutorError.md)

  ↳ **`FetchRequestError`**

## Table of contents

### Constructors

- [constructor](common.FetchRequestError.md#constructor)

### Properties

- [id](common.FetchRequestError.md#id)

## Constructors

### constructor

• **new FetchRequestError**(`id`, `originalError?`): [`FetchRequestError`](common.FetchRequestError.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |
| `originalError?` | `string` \| `Error` |

#### Returns

[`FetchRequestError`](common.FetchRequestError.md)

#### Overrides

[ExecutorError](common.ExecutorError.md).[constructor](common.ExecutorError.md#constructor)

#### Defined in

[packages/fe-utils/common/request/FetchRequest.ts:15](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/request/FetchRequest.ts#L15)

## Properties

### id

• **id**: `string`

#### Inherited from

[ExecutorError](common.ExecutorError.md).[id](common.ExecutorError.md#id)

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:54](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/executor/Executor.ts#L54)
