[@qlover/fe-utils - v1.0.6](../README.md) / [server](../modules/server.md) / Encryptor

# Interface: Encryptor\<ValueType, EncryptResult\>

[server](../modules/server.md).Encryptor

## Type parameters

| Name |
| :------ |
| `ValueType` |
| `EncryptResult` |

## Implemented by

- [`StringEntrypt`](../classes/server.StringEntrypt.md)
- [`StringZlibEncrypt`](../classes/server.StringZlibEncrypt.md)

## Table of contents

### Methods

- [decrypt](server.Encryptor.md#decrypt)
- [encrypt](server.Encryptor.md#encrypt)

## Methods

### decrypt

▸ **decrypt**(`encryptedData`): `ValueType`

#### Parameters

| Name | Type |
| :------ | :------ |
| `encryptedData` | `EncryptResult` |

#### Returns

`ValueType`

#### Defined in

[packages/fe-utils/server/encrypt/Encryptor.ts:3](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/server/encrypt/Encryptor.ts#L3)

___

### encrypt

▸ **encrypt**(`value`): `EncryptResult`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `ValueType` |

#### Returns

`EncryptResult`

#### Defined in

[packages/fe-utils/server/encrypt/Encryptor.ts:2](https://github.com/qlover/fe-base/blob/faa67aa70311a79a9a2b1bd71dd2d4a96758d762/packages/fe-utils/server/encrypt/Encryptor.ts#L2)
