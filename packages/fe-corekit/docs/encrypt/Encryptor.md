## `src/encrypt/Encryptor` (Module)

**Type:** `unknown`

---

### `Encryptor` (Interface)

**Type:** `unknown`

Generic interface for encryption/decryption operations
Provides a standard contract for implementing encryption strategies

**Example:**

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

---

#### `decrypt` (Method)

**Type:** `(encryptedData: EncryptResult) => ValueType`

#### Parameters

| Name            | Type            | Optional | Default | Since | Deprecated | Description     |
| --------------- | --------------- | -------- | ------- | ----- | ---------- | --------------- |
| `encryptedData` | `EncryptResult` | ❌       | -       | -     | -          | Data to decrypt |

---

##### `decrypt` (CallSignature)

**Type:** `ValueType`

Decrypts the encrypted data

**Returns:**

Original value

#### Parameters

| Name            | Type            | Optional | Default | Since | Deprecated | Description     |
| --------------- | --------------- | -------- | ------- | ----- | ---------- | --------------- |
| `encryptedData` | `EncryptResult` | ❌       | -       | -     | -          | Data to decrypt |

---

#### `encrypt` (Method)

**Type:** `(value: ValueType) => EncryptResult`

#### Parameters

| Name    | Type        | Optional | Default | Since | Deprecated | Description      |
| ------- | ----------- | -------- | ------- | ----- | ---------- | ---------------- |
| `value` | `ValueType` | ❌       | -       | -     | -          | Value to encrypt |

---

##### `encrypt` (CallSignature)

**Type:** `EncryptResult`

Encrypts the provided value

**Returns:**

Encrypted result

#### Parameters

| Name    | Type        | Optional | Default | Since | Deprecated | Description      |
| ------- | ----------- | -------- | ------- | ----- | ---------- | ---------------- |
| `value` | `ValueType` | ❌       | -       | -     | -          | Value to encrypt |

---
