## Class `StringEntrypt`
Represents a string encryption utility using AES-256-CBC algorithm.

This class provides methods to encrypt and decrypt string values securely.
It ensures that the encryption key meets the required length for AES-256.

@example 

```typescript
const encryptor = new StringEntrypt('your-encryption-key');
const encrypted = encryptor.encrypt('your-string');
const decrypted = encryptor.decrypt(encrypted);
```


## Members

### constructor
Creates a new StringEntrypt instance

**@throws** 

If key length is invalid


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  encryptionKey  | Key used for encryption/decryption | `string` |  |  |
|  encoding  | Output encoding format | `BufferEncoding` | 'base64' |  |


### decrypt
Decrypts an encrypted string
Extracts IV from encrypted data


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  encryptedData  | Encrypted string with IV | `string` |  |  |


### encrypt
Encrypts a string value
Uses random IV for each encryption


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

