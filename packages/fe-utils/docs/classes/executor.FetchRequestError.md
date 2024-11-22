[@qlover/fe-utils - v1.0.6](../README.md) / [executor](../modules/executor.md) / FetchRequestError

# Class: FetchRequestError

[executor](../modules/executor.md).FetchRequestError

Custom error class for fetch request failures
Extends ExecutorError to maintain error chain compatibility

**`Example`**

```typescript
throw new FetchRequestError(
  FetchRequestErrorID.RESPONSE_NOT_OK,
  'Server responded with 404'
);
```

## Hierarchy

- [`ExecutorError`](executor.ExecutorError.md)

  ↳ **`FetchRequestError`**

## Table of contents

### Constructors

- [constructor](executor.FetchRequestError.md#constructor)

### Properties

- [id](executor.FetchRequestError.md#id)

## Constructors

### constructor

• **new FetchRequestError**(`id`, `originalError?`): [`FetchRequestError`](executor.FetchRequestError.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |
| `originalError?` | `string` \| `Error` |

#### Returns

[`FetchRequestError`](executor.FetchRequestError.md)

#### Overrides

[ExecutorError](executor.ExecutorError.md).[constructor](executor.ExecutorError.md#constructor)

#### Defined in

[packages/fe-utils/common/request/FetchRequest.ts:36](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/request/FetchRequest.ts#L36)

## Properties

### id

• **id**: `string`

#### Inherited from

[ExecutorError](executor.ExecutorError.md).[id](executor.ExecutorError.md#id)

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:134](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/Executor.ts#L134)
