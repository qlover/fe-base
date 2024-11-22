[@qlover/fe-utils - v1.0.6](../README.md) / [server](../modules/server.md) / StringZlibEncrypt

# Class: StringZlibEncrypt

[server](../modules/server.md).StringZlibEncrypt

## Implements

- [`Encryptor`](../interfaces/server.Encryptor.md)\<`string`, `string`\>

## Table of contents

### Constructors

- [constructor](server.StringZlibEncrypt.md#constructor)

### Methods

- [decrypt](server.StringZlibEncrypt.md#decrypt)
- [encrypt](server.StringZlibEncrypt.md#encrypt)

## Constructors

### constructor

• **new StringZlibEncrypt**(`encryptionKey`, `encoding?`): [`StringZlibEncrypt`](server.StringZlibEncrypt.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `encryptionKey` | `string` | `undefined` |
| `encoding` | `BufferEncoding` | `'base64'` |

#### Returns

[`StringZlibEncrypt`](server.StringZlibEncrypt.md)

#### Defined in

[packages/fe-utils/server/encrypt/StringZlibEncrypt.ts:11](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/server/encrypt/StringZlibEncrypt.ts#L11)

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

[packages/fe-utils/server/encrypt/StringZlibEncrypt.ts:39](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/server/encrypt/StringZlibEncrypt.ts#L39)

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

[packages/fe-utils/server/encrypt/StringZlibEncrypt.ts:28](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/server/encrypt/StringZlibEncrypt.ts#L28)
