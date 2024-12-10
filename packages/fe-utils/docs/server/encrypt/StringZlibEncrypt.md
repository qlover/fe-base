## Class `StringZlibEncrypt`
String encryption implementation with Zlib compression
Combines AES encryption with data compression

Features:
- AES-128-CBC encryption
- Zlib compression
- IV support
- Configurable encoding

@implements 


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
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  encryptionKey  | Key used for encryption/decryption | `string` |  |  |
|  encoding  | Output encoding format | `BufferEncoding` | 'base64' |  |


### decrypt
Decrypts and decompresses an encrypted string
Applies decryption before decompression


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  encryptedData  | Encrypted string with IV | `string` |  |  |


### encrypt
Encrypts and compresses a string value
Applies compression before encryption


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  value  | String to encrypt | `string` |  |  |


### validateKey
Validates and processes encryption key
Ensures key meets length requirements

**@throws** 

If key length is invalid


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  key  | Raw encryption key | `string` |  |  |

