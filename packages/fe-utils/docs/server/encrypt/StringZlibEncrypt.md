## Class `StringZlibEncrypt`
String encryption implementation with Zlib compression
Combines AES encryption with data compression

Features:
- AES-128-CBC encryption
- Zlib compression
- IV support
- Configurable encoding

@example
```typescript
const encryptor = new StringZlibEncrypt('my-16-char-key!!');

// Encrypt and compress
const encrypted = encryptor.encrypt('large text data');

// Decrypt and decompress
const decrypted = encryptor.decrypt(encrypted);
```

## Members

### constructor
Creates a new StringZlibEncrypt instance

**@throws**
If key length is invalid


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  encryptionKey  | `string` |  |  | Key used for encryption/decryption  |
|  encoding  | `BufferEncoding` | 'base64' |  | Output encoding format  |


### decrypt
Decrypts and decompresses an encrypted string
Applies decryption before decompression


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  encryptedData  | `string` |  |  | Encrypted string with IV  |


### encrypt
Encrypts and compresses a string value
Applies compression before encryption


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  value  | `string` |  |  | String to encrypt  |


### validateKey
Validates and processes encryption key
Ensures key meets length requirements

**@throws**
If key length is invalid


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  key  | `string` |  |  | Raw encryption key  |

