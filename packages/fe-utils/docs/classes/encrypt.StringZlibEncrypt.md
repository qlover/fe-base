[@qlover/fe-utils - v1.0.6](../README.md) / [encrypt](../modules/encrypt.md) / StringZlibEncrypt

# Class: StringZlibEncrypt

[encrypt](../modules/encrypt.md).StringZlibEncrypt

String encryption implementation with Zlib compression
Combines AES encryption with data compression

Features:
- AES-128-CBC encryption
- Zlib compression
- IV support
- Configurable encoding

**`Implements`**

**`Example`**

```typescript
const encryptor = new StringZlibEncrypt('my-16-char-key!!');

// Encrypt and compress
const encrypted = encryptor.encrypt('large text data');

// Decrypt and decompress
const decrypted = encryptor.decrypt(encrypted);
```

## Implements

- [`Encryptor`](../interfaces/encrypt.Encryptor.md)\<`string`, `string`\>

## Table of contents

### Constructors

- [constructor](encrypt.StringZlibEncrypt.md#constructor)

### Methods

- [decrypt](encrypt.StringZlibEncrypt.md#decrypt)
- [encrypt](encrypt.StringZlibEncrypt.md#encrypt)

## Constructors

### constructor

• **new StringZlibEncrypt**(`encryptionKey`, `encoding?`): [`StringZlibEncrypt`](encrypt.StringZlibEncrypt.md)

Creates a new StringZlibEncrypt instance

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `encryptionKey` | `string` | `undefined` | Key used for encryption/decryption |
| `encoding` | `BufferEncoding` | `'base64'` | Output encoding format |

#### Returns

[`StringZlibEncrypt`](encrypt.StringZlibEncrypt.md)

**`Throws`**

If key length is invalid

#### Defined in

[packages/fe-utils/server/encrypt/StringZlibEncrypt.ts:41](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/server/encrypt/StringZlibEncrypt.ts#L41)

## Methods

### decrypt

▸ **decrypt**(`encryptedData`): `string`

Decrypts and decompresses an encrypted string
Applies decryption before decompression

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `encryptedData` | `string` | Encrypted string with IV |

#### Returns

`string`

Original string

#### Implementation of

[Encryptor](../interfaces/encrypt.Encryptor.md).[decrypt](../interfaces/encrypt.Encryptor.md#decrypt)

#### Defined in

[packages/fe-utils/server/encrypt/StringZlibEncrypt.ts:91](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/server/encrypt/StringZlibEncrypt.ts#L91)

___

### encrypt

▸ **encrypt**(`value`): `string`

Encrypts and compresses a string value
Applies compression before encryption

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `string` | String to encrypt |

#### Returns

`string`

Encrypted and compressed string with IV

#### Implementation of

[Encryptor](../interfaces/encrypt.Encryptor.md).[encrypt](../interfaces/encrypt.Encryptor.md#encrypt)

#### Defined in

[packages/fe-utils/server/encrypt/StringZlibEncrypt.ts:73](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/server/encrypt/StringZlibEncrypt.ts#L73)
