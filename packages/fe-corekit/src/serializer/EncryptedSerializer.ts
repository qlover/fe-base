import { type Serializer } from './Serializer';
import { type Encryptor } from '../encrypt';

/**
 * Encrypted serializer that adds encryption capabilities to any existing serializer
 *
 * Significance: Provides transparent encryption layer for data serialization
 * Core idea: Combine serialization and encryption through composition pattern
 * Main function: Encrypt serialized data and decrypt before deserialization
 * Main purpose: Enable secure data storage with any serialization strategy
 *
 * Features:
 * - Wraps any existing serializer implementation
 * - Transparent encryption/decryption operations
 * - Type-safe with generic support
 * - Maintains serializer interface compatibility
 *
 * @template T - The type of data to serialize/deserialize
 * @template R - The type of serialized result (defaults to string)
 *
 * @example
 * ```typescript
 * import { EncryptedSerializer } from './EncryptedSerializer';
 * import { JSONSerializer } from './JSONSerializer';
 * import { AESEncryptor } from '../encrypt/AESEncryptor';
 *
 * const encryptor = new AESEncryptor('your-secret-key');
 * const baseSerializer = new JSONSerializer();
 * const encryptedSerializer = new EncryptedSerializer(baseSerializer, encryptor);
 *
 * // Usage with ObjectStorage
 * const storage = new ObjectStorage(encryptedSerializer);
 * storage.setItem('sensitive-data', { userId: 123, token: 'abc' });
 * ```
 *
 * @since 1.6.0
 */
export class EncryptedSerializer<T = unknown, R = string> implements Serializer<T, R> {
  /**
   * Creates a new EncryptedSerializer instance
   *
   * @param baseSerializer - The underlying serializer to wrap with encryption
   * @param encryptor - The encryptor instance for encryption/decryption operations
   *
   * @example
   * ```typescript
   * const encryptedSerializer = new EncryptedSerializer(
   *   new JSONSerializer(),
   *   new AESEncryptor('secret-key')
   * );
   * ```
   */
  constructor(
    /**
     * Base serializer for data transformation
     *
     * Significance: Handles the actual serialization logic
     * Core idea: Delegate serialization to specialized implementations
     * Main function: Convert objects to/from serialized format
     * Main purpose: Maintain separation of concerns between serialization and encryption
     */
    private readonly baseSerializer: Serializer<T, R>,
    /**
     * Encryptor for data security
     *
     * Significance: Provides encryption/decryption capabilities
     * Core idea: Secure serialized data through encryption
     * Main function: Encrypt/decrypt serialized data
     * Main purpose: Ensure data confidentiality in storage
     */
    private readonly encryptor: Encryptor<R, R>
  ) {}

  /**
   * Serializes and encrypts data
   *
   * Significance: Primary method for secure data serialization
   * Core idea: Chain serialization and encryption operations
   * Main function: Convert data to encrypted serialized format
   * Main purpose: Prepare data for secure storage
   *
   * Process:
   * 1. Serialize data using base serializer
   * 2. Encrypt the serialized result
   * 3. Return encrypted data
   *
   * @param data - Data to serialize and encrypt
   * @returns Encrypted serialized data
   *
   * @example
   * ```typescript
   * const encryptedData = serializer.serialize({ userId: 123 });
   * // Returns encrypted string instead of plain JSON
   * ```
   */
  serialize(data: T): R {
    const serialized = this.baseSerializer.serialize(data);
    return this.encryptor.encrypt(serialized);
  }

  /**
   * Decrypts and deserializes data
   *
   * Significance: Primary method for secure data deserialization
   * Core idea: Chain decryption and deserialization operations
   * Main function: Convert encrypted data back to original format
   * Main purpose: Retrieve data from secure storage
   *
   * Process:
   * 1. Decrypt the encrypted data
   * 2. Deserialize using base serializer
   * 3. Return original data or default value on failure
   *
   * @param data - Encrypted serialized data to decrypt and deserialize
   * @param defaultValue - Optional default value to return if operation fails
   * @returns Original data structure or default value
   *
   * @example
   * ```typescript
   * const originalData = serializer.deserialize(encryptedData, {});
   * // Returns decrypted and deserialized object
   * ```
   */
  deserialize(data: R, defaultValue?: T): T {
    try {
      const decrypted = this.encryptor.decrypt(data);
      return this.baseSerializer.deserialize(decrypted, defaultValue);
    } catch {
      // Return default value if decryption or deserialization fails
      return defaultValue as T;
    }
  }

  /**
   * Gets the underlying base serializer
   *
   * Significance: Provides access to the wrapped serializer
   * Core idea: Enable access to base serializer for advanced use cases
   * Main function: Return the base serializer instance
   * Main purpose: Allow direct access when encryption is not needed
   *
   * @returns The base serializer instance
   *
   * @example
   * ```typescript
   * const baseSerializer = encryptedSerializer.getBaseSerializer();
   * // Direct access to underlying serializer
   * ```
   */
  getBaseSerializer(): Serializer<T, R> {
    return this.baseSerializer;
  }

  /**
   * Gets the encryptor instance
   *
   * Significance: Provides access to the encryption logic
   * Core idea: Enable access to encryptor for advanced use cases
   * Main function: Return the encryptor instance
   * Main purpose: Allow direct encryption operations when needed
   *
   * @returns The encryptor instance
   *
   * @example
   * ```typescript
   * const encryptor = encryptedSerializer.getEncryptor();
   * // Direct access to encryption capabilities
   * ```
   */
  getEncryptor(): Encryptor<R, R> {
    return this.encryptor;
  }
} 