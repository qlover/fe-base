[@qlover/fe-utils - v1.0.6](../README.md) / [encrypt](../modules/encrypt.md) / Encryptor

# Interface: Encryptor\<ValueType, EncryptResult\>

[encrypt](../modules/encrypt.md).Encryptor

Generic interface for encryption/decryption operations
Provides a standard contract for implementing encryption strategies

**`Example`**

```typescript
// String encryption implementation
class StringEncryptor implements Encryptor<string, string> {
  encrypt(value: string): string {
    // Encryption logic
  }

  decrypt(encryptedData: string): string {
    // Decryption logic
  }
}
```

## Type parameters

| Name | Description |
| :------ | :------ |
| `ValueType` | Type of value to encrypt/decrypt |
| `EncryptResult` | Type of encrypted result |

## Implemented by

- [`StringEntrypt`](../classes/encrypt.StringEntrypt.md)
- [`StringZlibEncrypt`](../classes/encrypt.StringZlibEncrypt.md)

## Table of contents

### Methods

- [decrypt](encrypt.Encryptor.md#decrypt)
- [encrypt](encrypt.Encryptor.md#encrypt)

## Methods

### decrypt

▸ **decrypt**(`encryptedData`): `ValueType`

Decrypts the encrypted data

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `encryptedData` | `EncryptResult` | Data to decrypt |

#### Returns

`ValueType`

Original value

#### Defined in

[packages/fe-utils/server/encrypt/Encryptor.ts:35](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/server/encrypt/Encryptor.ts#L35)

___

### encrypt

▸ **encrypt**(`value`): `EncryptResult`

Encrypts the provided value

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `ValueType` | Value to encrypt |

#### Returns

`EncryptResult`

Encrypted result

#### Defined in

[packages/fe-utils/server/encrypt/Encryptor.ts:28](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/server/encrypt/Encryptor.ts#L28)
