## `Encrypt` (Module)

**Type:** `module Encrypt`

Data encryption and decryption interface definitions

This module provides interface definitions for data encryption and decryption
operations. It defines a standard contract for implementing encryption algorithms
that can be used with storage systems or for secure data transmission.

Core functionality:

- Encryption interface: Standard contract for encryption implementations
  - Encrypt data to secure format
  - Decrypt data back to original format
  - Support for different encryption algorithms
  - Type-safe encryption operations

- Integration support: Works with storage and serialization
  - Can be combined with storage systems for secure data persistence
  - Compatible with serialization for complex data types
  - Supports chaining with other data transformations

### Exported Members

- `EncryptorInterface`: Base interface for encryption implementations

### Basic Usage

```typescript
import { EncryptorInterface } from '@qlover/fe-corekit';

// Implement custom encryptor
class AESEncryptor implements EncryptorInterface {
  constructor(private key: string) {}

  encrypt(data: string): string {
    // Implement AES encryption
    return encryptAES(data, this.key);
  }

  decrypt(data: string): string {
    // Implement AES decryption
    return decryptAES(data, this.key);
  }
}

const encryptor = new AESEncryptor('my-secret-key');
const encrypted = encryptor.encrypt('sensitive data');
const decrypted = encryptor.decrypt(encrypted);
```

### Storage Integration

```typescript
import {
  EncryptorInterface,
  SyncStorage,
  JSONSerializer
} from '@qlover/fe-corekit';

// Encrypted storage wrapper
class EncryptedStorage<T> extends SyncStorage<T> {
  constructor(
    backend: Storage,
    serializer: SerializerInterface<T>,
    private encryptor: EncryptorInterface
  ) {
    super(backend, serializer);
  }

  set(key: string, value: T, options?: ExpireOptions): void {
    const serialized = this.serializer.serialize(value);
    const encrypted = this.encryptor.encrypt(serialized);
    this.backend.setItem(key, encrypted);
  }

  get(key: string): T | null {
    const encrypted = this.backend.getItem(key);
    if (!encrypted) return null;

    const decrypted = this.encryptor.decrypt(encrypted);
    return this.serializer.deserialize(decrypted);
  }
}

const storage = new EncryptedStorage(
  localStorage,
  new JSONSerializer(),
  new AESEncryptor('secret-key')
);

storage.set('user', { id: 1, password: 'secret' });
```

### Implementation Examples

```typescript
import { EncryptorInterface } from '@qlover/fe-corekit';

// Simple XOR encryptor
class XOREncryptor implements EncryptorInterface {
  constructor(private key: string) {}

  encrypt(data: string): string {
    return this.xor(data, this.key);
  }

  decrypt(data: string): string {
    return this.xor(data, this.key);
  }

  private xor(data: string, key: string): string {
    let result = '';
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(
        data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return result;
  }
}

// Base64 obfuscation encryptor
class Base64Encryptor implements EncryptorInterface {
  encrypt(data: string): string {
    return btoa(data);
  }

  decrypt(data: string): string {
    return atob(data);
  }
}
```

### Chained Encryption

```typescript
import { EncryptorInterface } from '@qlover/fe-corekit';

// Chain multiple encryptors
class ChainedEncryptor implements EncryptorInterface {
  constructor(private encryptors: EncryptorInterface[]) {}

  encrypt(data: string): string {
    return this.encryptors.reduce(
      (result, encryptor) => encryptor.encrypt(result),
      data
    );
  }

  decrypt(data: string): string {
    return this.encryptors.reduceRight(
      (result, encryptor) => encryptor.decrypt(result),
      data
    );
  }
}

const encryptor = new ChainedEncryptor([
  new AESEncryptor('key1'),
  new Base64Encryptor()
]);
```

**See:**

- <a href="./EncryptorInterface.md#encryptorinterface-interface" class="tsd-kind-interface">EncryptorInterface</a> for the encryption interface
- <a href="https://github.com/qlover/fe-base/tree/main/packages/corekit-node">https://github.com/qlover/fe-base/tree/main/packages/corekit-node</a> for Node.js encryption implementations

---
