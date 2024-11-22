[@qlover/fe-utils - v1.0.6](../README.md) / [executor](../modules/executor.md) / Logger

# Class: Logger

[executor](../modules/executor.md).Logger

Flexible logging utility class with support for different environments and log levels

Features:
- Multiple log levels (LOG, INFO, ERROR, WARN, DEBUG)
- Environment-aware logging (CI, debug mode)
- Dry run support for command execution
- Silent mode for suppressing output
- Verbose and debug mode support

**`Example`**

```typescript
// Basic usage
const logger = new Logger();
logger.info('Application started');
logger.error('An error occurred:', error);

// Debug mode
const debugLogger = new Logger({ debug: true });
debugLogger.debug('Debug info:', { data });

// CI environment
const ciLogger = new Logger({ isCI: true });
ciLogger.exec('npm install', { isDryRun: true });
```

## Table of contents

### Constructors

- [constructor](executor.Logger.md#constructor)

### Methods

- [debug](executor.Logger.md#debug)
- [error](executor.Logger.md#error)
- [exec](executor.Logger.md#exec)
- [info](executor.Logger.md#info)
- [log](executor.Logger.md#log)
- [obtrusive](executor.Logger.md#obtrusive)
- [prefix](executor.Logger.md#prefix)
- [verbose](executor.Logger.md#verbose)
- [warn](executor.Logger.md#warn)

## Constructors

### constructor

• **new Logger**(`options?`): [`Logger`](executor.Logger.md)

Creates a new Logger instance

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `options` | `Object` | `{}` | Logger configuration options |
| `options.debug` | `undefined` \| `boolean` | `false` | Whether to enable debug output |
| `options.dryRun` | `undefined` \| `boolean` | `false` | Whether to perform dry run only |
| `options.isCI` | `undefined` \| `boolean` | `false` | Whether running in CI environment |
| `options.silent` | `undefined` \| `boolean` | `false` | Whether to suppress all output |

#### Returns

[`Logger`](executor.Logger.md)

#### Defined in

[packages/fe-utils/common/logger/index.ts:74](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/logger/index.ts#L74)

## Methods

### debug

▸ **debug**(`...args`): `void`

Debug log output
Only active when debug mode is enabled
Formats objects as JSON strings

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...args` | `unknown`[] | Values to log |

#### Returns

`void`

#### Defined in

[packages/fe-utils/common/logger/index.ts:150](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/logger/index.ts#L150)

___

### error

▸ **error**(`...args`): `void`

Error log output

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...args` | `unknown`[] | Values to log |

#### Returns

`void`

#### Defined in

[packages/fe-utils/common/logger/index.ts:139](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/logger/index.ts#L139)

___

### exec

▸ **exec**(`...args`): `void`

Command execution logging
Supports dry run mode and external command indication

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...args` | `unknown`[] | Command arguments and options |

#### Returns

`void`

**`Example`**

```typescript
logger.exec('npm', 'install', { isDryRun: true });
logger.exec(['git', 'commit', '-m', 'feat: update'], { isExternal: true });
```

#### Defined in

[packages/fe-utils/common/logger/index.ts:191](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/logger/index.ts#L191)

___

### info

▸ **info**(`...args`): `void`

Informational log output

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...args` | `unknown`[] | Values to log |

#### Returns

`void`

#### Defined in

[packages/fe-utils/common/logger/index.ts:123](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/logger/index.ts#L123)

___

### log

▸ **log**(`...args`): `void`

Basic log output

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...args` | `unknown`[] | Values to log |

#### Returns

`void`

#### Defined in

[packages/fe-utils/common/logger/index.ts:115](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/logger/index.ts#L115)

___

### obtrusive

▸ **obtrusive**(`...args`): `void`

Obtrusive log output
Adds extra line breaks in non-CI environments

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...args` | `unknown`[] | Values to log |

#### Returns

`void`

#### Defined in

[packages/fe-utils/common/logger/index.ts:214](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/logger/index.ts#L214)

___

### prefix

▸ **prefix**(`value`, `_level?`): `string` \| `string`[]

Adds prefix to log messages
Can be overridden to customize log format

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `string` | The prefix value |
| `_level?` | [`LogLevel`](../modules/executor.md#loglevel) | Log level (optional) |

#### Returns

`string` \| `string`[]

Formatted prefix string or array

#### Defined in

[packages/fe-utils/common/logger/index.ts:107](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/logger/index.ts#L107)

___

### verbose

▸ **verbose**(`...args`): `void`

Verbose log output
Only active when debug mode is enabled
Uses purple color for output

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...args` | `unknown`[] | Values to log |

#### Returns

`void`

#### Defined in

[packages/fe-utils/common/logger/index.ts:173](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/logger/index.ts#L173)

___

### warn

▸ **warn**(`...args`): `void`

Warning log output

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...args` | `unknown`[] | Values to log |

#### Returns

`void`

#### Defined in

[packages/fe-utils/common/logger/index.ts:131](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/common/logger/index.ts#L131)
