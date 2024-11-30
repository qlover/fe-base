## Interface `Encryptor`
Generic interface for encryption/decryption operations
Provides a standard contract for implementing encryption strategies

@example 

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


## Members

### decrypt
Decrypts the encrypted data


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  encryptedData  | `EncryptResult` |  |  | Data to decrypt  |


### encrypt
Encrypts the provided value


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  value  | `ValueType` |  |  | Value to encrypt  |

