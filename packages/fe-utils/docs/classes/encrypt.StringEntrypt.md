[@qlover/fe-utils - v1.0.6](../README.md) / [encrypt](../modules/encrypt.md) / StringEntrypt

# Class: StringEntrypt

[encrypt](../modules/encrypt.md).StringEntrypt

String encryption implementation using AES-256-CBC
Provides secure string encryption with IV support

Features:
- AES-256-CBC encryption
- IV (Initialization Vector) for enhanced security
- Configurable encoding
- Key length validation

**`Implements`**

**`Example`**

```typescript
const encryptor = new StringEntrypt('my-32-character-secret-key-here!');

// Encrypt string
const encrypted = encryptor.encrypt('sensitive data');

// Decrypt string
const decrypted = encryptor.decrypt(encrypted);
```

## Implements

- [`Encryptor`](../interfaces/encrypt.Encryptor.md)\<`string`, `string`\>

## Table of contents

### Constructors

- [constructor](encrypt.StringEntrypt.md#constructor)

### Methods

- [decrypt](encrypt.StringEntrypt.md#decrypt)
- [encrypt](encrypt.StringEntrypt.md#encrypt)

## Constructors

### constructor

• **new StringEntrypt**(`encryptionKey`, `encoding?`): [`StringEntrypt`](encrypt.StringEntrypt.md)

Creates a new StringEntrypt instance

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `encryptionKey` | `string` | `undefined` | Key used for encryption/decryption |
| `encoding` | `BufferEncoding` | `'base64'` | Output encoding format |

#### Returns

[`StringEntrypt`](encrypt.StringEntrypt.md)

**`Throws`**

If key length is invalid

#### Defined in

[packages/fe-utils/server/encrypt/StringEntrypt.ts:39](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/server/encrypt/StringEntrypt.ts#L39)

## Methods

### decrypt

▸ **decrypt**(`encryptedData`): `string`

Decrypts an encrypted string
Extracts IV from encrypted data

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

[packages/fe-utils/server/encrypt/StringEntrypt.ts:88](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/server/encrypt/StringEntrypt.ts#L88)

___

### encrypt

▸ **encrypt**(`value`): `string`

Encrypts a string value
Uses random IV for each encryption

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `string` | String to encrypt |

#### Returns

`string`

Encrypted string with IV

#### Implementation of

[Encryptor](../interfaces/encrypt.Encryptor.md).[encrypt](../interfaces/encrypt.Encryptor.md#encrypt)

#### Defined in

[packages/fe-utils/server/encrypt/StringEntrypt.ts:73](https://github.com/qlover/fe-base/blob/9c83c9119a4a7dab713ef9563531279977b67683/packages/fe-utils/server/encrypt/StringEntrypt.ts#L73)
