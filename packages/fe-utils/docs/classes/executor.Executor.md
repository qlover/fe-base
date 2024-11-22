[@qlover/fe-utils - v1.0.6](../README.md) / [executor](../modules/executor.md) / Executor

# Class: Executor

[executor](../modules/executor.md).Executor

Base executor class providing plugin management and execution pipeline

The Executor pattern implements a pluggable execution pipeline that allows:
1. Pre-processing of input data
2. Post-processing of results
3. Error handling
4. Custom execution logic

**`Abstract`**

Executor

**`Example`**

```typescript
// Create an executor instance
const executor = new AsyncExecutor();

// Add plugins
executor.use(new LoggerPlugin());
executor.use(new RetryPlugin({ maxAttempts: 3 }));

// Execute a task
const result = await executor.exec(async (data) => {
  return await someAsyncOperation(data);
});
```

## Hierarchy

- **`Executor`**

  ↳ [`AsyncExecutor`](executor.AsyncExecutor.md)

  ↳ [`SyncExecutor`](executor.SyncExecutor.md)

## Table of contents

### Constructors

- [constructor](executor.Executor.md#constructor)

### Methods

- [exec](executor.Executor.md#exec)
- [execNoError](executor.Executor.md#execnoerror)
- [runHook](executor.Executor.md#runhook)
- [use](executor.Executor.md#use)

## Constructors

### constructor

• **new Executor**(`config?`): [`Executor`](executor.Executor.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`ExecutorConfig`](../interfaces/executor.ExecutorConfig.md) |

#### Returns

[`Executor`](executor.Executor.md)

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:187](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/Executor.ts#L187)

## Methods

### exec

▸ **exec**\<`T`\>(`task`): `T` \| `Promise`\<`T`\>

Execute a task with plugin pipeline

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `task` | [`Task`](../modules/executor.md#task)\<`T`, `unknown`\> | Task to execute |

#### Returns

`T` \| `Promise`\<`T`\>

**`Throws`**

If task execution fails

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:225](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/Executor.ts#L225)

▸ **exec**\<`T`\>(`data`, `task`): `T` \| `Promise`\<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `unknown` |
| `task` | [`Task`](../modules/executor.md#task)\<`T`, `unknown`\> |

#### Returns

`T` \| `Promise`\<`T`\>

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:226](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/Executor.ts#L226)

___

### execNoError

▸ **execNoError**\<`T`\>(`task`): [`ExecutorError`](executor.ExecutorError.md) \| `T` \| `Promise`\<[`ExecutorError`](executor.ExecutorError.md) \| `T`\>

Execute a task without throwing errors
All errors are wrapped in ExecutorError

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `task` | [`Task`](../modules/executor.md#task)\<`T`, `unknown`\> | Task to execute |

#### Returns

[`ExecutorError`](executor.ExecutorError.md) \| `T` \| `Promise`\<[`ExecutorError`](executor.ExecutorError.md) \| `T`\>

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:233](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/Executor.ts#L233)

▸ **execNoError**\<`T`\>(`data`, `task`): [`ExecutorError`](executor.ExecutorError.md) \| `T` \| `Promise`\<[`ExecutorError`](executor.ExecutorError.md) \| `T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `unknown` |
| `task` | [`Task`](../modules/executor.md#task)\<`T`, `unknown`\> |

#### Returns

[`ExecutorError`](executor.ExecutorError.md) \| `T` \| `Promise`\<[`ExecutorError`](executor.ExecutorError.md) \| `T`\>

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:236](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/Executor.ts#L236)

___

### runHook

▸ **runHook**(`plugins`, `name`, `...args`): `unknown`

Execute a plugin hook
Must be implemented by concrete executor classes

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `plugins` | [`ExecutorPlugin`](executor.ExecutorPlugin.md)\<`unknown`, `unknown`\>[] | Plugins to execute |
| `name` | keyof [`ExecutorPlugin`](executor.ExecutorPlugin.md)\<`unknown`, `unknown`\> | Hook name to execute |
| `...args` | `unknown`[] | Arguments for the hook |

#### Returns

`unknown`

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:214](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/Executor.ts#L214)

___

### use

▸ **use**(`plugin`): `void`

Add a plugin to the executor

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `plugin` | [`ExecutorPlugin`](executor.ExecutorPlugin.md)\<`unknown`, `unknown`\> | Plugin instance to add |

#### Returns

`void`

#### Defined in

[packages/fe-utils/common/executor/Executor.ts:193](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/executor/Executor.ts#L193)
