[@qlover/fe-utils - v1.0.6](../README.md) / [server](../modules/server.md) / StringEntrypt

# Class: StringEntrypt

[server](../modules/server.md).StringEntrypt

## Implements

- [`Encryptor`](../interfaces/server.Encryptor.md)\<`string`, `string`\>

## Table of contents

### Constructors

- [constructor](server.StringEntrypt.md#constructor)

### Methods

- [decrypt](server.StringEntrypt.md#decrypt)
- [encrypt](server.StringEntrypt.md#encrypt)

## Constructors

### constructor

• **new StringEntrypt**(`encryptionKey`, `encoding?`): [`StringEntrypt`](server.StringEntrypt.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `encryptionKey` | `string` | `undefined` |
| `encoding` | `BufferEncoding` | `'base64'` |

#### Returns

[`StringEntrypt`](server.StringEntrypt.md)

#### Defined in

[packages/fe-utils/server/encrypt/StringEntrypt.ts:10](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/server/encrypt/StringEntrypt.ts#L10)

## Methods

### decrypt

▸ **decrypt**(`encryptedData`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `encryptedData` | `string` |

#### Returns

`string`

#### Implementation of

[Encryptor](../interfaces/server.Encryptor.md).[decrypt](../interfaces/server.Encryptor.md#decrypt)

#### Defined in

[packages/fe-utils/server/encrypt/StringEntrypt.ts:37](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/server/encrypt/StringEntrypt.ts#L37)

___

### encrypt

▸ **encrypt**(`value`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `string` |

#### Returns

`string`

#### Implementation of

[Encryptor](../interfaces/server.Encryptor.md).[encrypt](../interfaces/server.Encryptor.md#encrypt)

#### Defined in

[packages/fe-utils/server/encrypt/StringEntrypt.ts:29](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/server/encrypt/StringEntrypt.ts#L29)
