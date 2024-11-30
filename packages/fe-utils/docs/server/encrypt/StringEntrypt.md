## Class `StringEntrypt`


## Members

### constructor
Creates a new StringEntrypt instance

**@throws** 

If key length is invalid


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  encryptionKey  | `string` |  |  | Key used for encryption/decryption  |
|  encoding  | `BufferEncoding` | 'base64' |  | Output encoding format  |


### decrypt
Decrypts an encrypted string
Extracts IV from encrypted data


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  encryptedData  | `string` |  |  | Encrypted string with IV  |


### encrypt
Encrypts a string value
Uses random IV for each encryption


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

