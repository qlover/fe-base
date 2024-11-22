[@qlover/fe-utils - v1.0.6](../README.md) / [common](../modules/common.md) / Logger

# Class: Logger

[common](../modules/common.md).Logger

## Table of contents

### Constructors

- [constructor](common.Logger.md#constructor)

### Methods

- [debug](common.Logger.md#debug)
- [error](common.Logger.md#error)
- [exec](common.Logger.md#exec)
- [info](common.Logger.md#info)
- [log](common.Logger.md#log)
- [obtrusive](common.Logger.md#obtrusive)
- [prefix](common.Logger.md#prefix)
- [verbose](common.Logger.md#verbose)
- [warn](common.Logger.md#warn)

## Constructors

### constructor

• **new Logger**(`«destructured»?`): [`Logger`](common.Logger.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `«destructured»` | `Object` | `{}` |
| › `debug` | `undefined` \| `boolean` | `false` |
| › `dryRun` | `undefined` \| `boolean` | `false` |
| › `isCI` | `undefined` \| `boolean` | `false` |
| › `silent` | `undefined` \| `boolean` | `false` |

#### Returns

[`Logger`](common.Logger.md)

#### Defined in

[packages/fe-utils/common/logger/index.ts:30](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/logger/index.ts#L30)

## Methods

### debug

▸ **debug**(`...args`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `unknown`[] |

#### Returns

`void`

#### Defined in

[packages/fe-utils/common/logger/index.ts:73](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/logger/index.ts#L73)

___

### error

▸ **error**(`...args`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `unknown`[] |

#### Returns

`void`

#### Defined in

[packages/fe-utils/common/logger/index.ts:69](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/logger/index.ts#L69)

___

### exec

▸ **exec**(`...args`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `unknown`[] |

#### Returns

`void`

#### Defined in

[packages/fe-utils/common/logger/index.ts:96](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/logger/index.ts#L96)

___

### info

▸ **info**(`...args`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `unknown`[] |

#### Returns

`void`

#### Defined in

[packages/fe-utils/common/logger/index.ts:61](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/logger/index.ts#L61)

___

### log

▸ **log**(`...args`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `unknown`[] |

#### Returns

`void`

#### Defined in

[packages/fe-utils/common/logger/index.ts:57](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/logger/index.ts#L57)

___

### obtrusive

▸ **obtrusive**(`...args`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `unknown`[] |

#### Returns

`void`

#### Defined in

[packages/fe-utils/common/logger/index.ts:113](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/logger/index.ts#L113)

___

### prefix

▸ **prefix**(`value`, `_level?`): `string` \| `string`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `string` |
| `_level?` | [`LogLevel`](../modules/common.md#loglevel) |

#### Returns

`string` \| `string`[]

#### Defined in

[packages/fe-utils/common/logger/index.ts:53](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/logger/index.ts#L53)

___

### verbose

▸ **verbose**(`...args`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `unknown`[] |

#### Returns

`void`

#### Defined in

[packages/fe-utils/common/logger/index.ts:89](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/logger/index.ts#L89)

___

### warn

▸ **warn**(`...args`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `unknown`[] |

#### Returns

`void`

#### Defined in

[packages/fe-utils/common/logger/index.ts:65](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/common/logger/index.ts#L65)
