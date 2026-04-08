## `src/encrypt/EncryptorInterface` (Module)

**Type:** `module src/encrypt/EncryptorInterface`

---

### `EncryptorInterface` (Interface)

**Type:** `interface EncryptorInterface<ValueType, EncryptResult>`

**Since:** `3.0.0`

Generic interface for encryption/decryption operations

Core concept:
Provides a standard contract for implementing encryption strategies,
enabling secure data transformation with a consistent API across
different encryption algorithms and implementations.

Main features:

- Algorithm abstraction: Support for any encryption algorithm
  - Symmetric encryption (AES, DES, etc.)
  - Asymmetric encryption (RSA, etc.)
  - Custom encryption schemes
  - Hash-based encryption

- Type safety: Generic type parameters for input/output types
  - `ValueType`: Type of data to encrypt/decrypt
  - `EncryptResult`: Type of encrypted output
  - Compile-time type checking
  - Type inference support

- Bidirectional operations: Encrypt and decrypt with same interface
  - Reversible encryption
  - Consistent API for both operations
  - Easy to implement and test

Use cases:

- Secure storage: Encrypt sensitive data before storing
- Data transmission: Encrypt data for network transfer
- Password protection: Encrypt user credentials
- Configuration security: Encrypt configuration values

Design considerations:

- Simple interface: Only two methods required
- Flexible types: Works with strings, buffers, objects
- Composable: Can be chained with serializers
- Testable: Easy to mock and test

**Note:**

In version `3.0.0`, the interface was renamed from `Encryptor` to `EncryptorInterface`

**Example:** String encryption

```typescript
class AESEncryptor implements EncryptorInterface<string, string> {
  constructor(private key: string) {}

  encrypt(value: string): string {
    return encryptAES(value, this.key);
  }

  decrypt(encryptedData: string): string {
    return decryptAES(encryptedData, this.key);
  }
}

const encryptor = new AESEncryptor('my-secret-key');
const encrypted = encryptor.encrypt('sensitive data');
const decrypted = encryptor.decrypt(encrypted);
```

**Example:** Object encryption

```typescript
class ObjectEncryptor implements EncryptorInterface<object, string> {
  encrypt(value: object): string {
    const json = JSON.stringify(value);
    return encryptString(json);
  }

  decrypt(encryptedData: string): object {
    const json = decryptString(encryptedData);
    return JSON.parse(json);
  }
}
```

**Example:** With storage integration

```typescript
import {
  SyncStorage,
  JSONSerializer,
  EncryptorInterface
} from '@qlover/fe-corekit';

class MyEncryptor implements EncryptorInterface<string, string> {
  encrypt(value: string): string {
    return btoa(value);
  }
  decrypt(data: string): string {
    return atob(data);
  }
}

const storage = new SyncStorage(localStorage, [
  new JSONSerializer(),
  new MyEncryptor()
]);

// Data is serialized then encrypted
storage.setItem('user', { password: 'secret' });
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

Transforms encrypted data back to its original format. Should be
the inverse operation of `encrypt`.

**Returns:**

Original value

**Example:**

```typescript
const encryptor = new AESEncryptor('key');
const encrypted = encryptor.encrypt('data');
const decrypted = encryptor.decrypt(encrypted);
console.log(decrypted); // 'data'
```

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

Transforms the input value into an encrypted format. The encryption
should be reversible through the `decrypt` method.

**Returns:**

Encrypted result

**Example:**

```typescript
const encryptor = new AESEncryptor('key');
const encrypted = encryptor.encrypt('sensitive data');
console.log(encrypted); // Encrypted string
```

#### Parameters

| Name    | Type        | Optional | Default | Since | Deprecated | Description      |
| ------- | ----------- | -------- | ------- | ----- | ---------- | ---------------- |
| `value` | `ValueType` | ❌       | -       | -     | -          | Value to encrypt |

---
