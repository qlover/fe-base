/**
 * @module CorekitNode
 * @description Node.js-specific implementations for fe-corekit utilities
 *
 * This module provides Node.js-specific implementations of core utilities,
 * particularly focusing on encryption and other server-side operations that
 * require Node.js built-in modules or capabilities.
 *
 * Core functionality:
 * - Encryption utilities: Node.js-based encryption implementations
 *   - String encryption using Node.js crypto module
 *   - Zlib compression with encryption
 *   - Support for various encryption algorithms
 *   - Secure key management
 *
 * ### Exported Members
 *
 * **Encryption:**
 * - String encryption implementations
 * - Compression with encryption
 * - Encryption interfaces
 *
 * ### Basic Usage
 *
 * ```typescript
 * import { StringEncrypt } from '@qlover/corekit-node';
 *
 * const encryptor = new StringEncrypt('my-secret-key');
 *
 * // Encrypt data
 * const encrypted = encryptor.encrypt('sensitive data');
 *
 * // Decrypt data
 * const decrypted = encryptor.decrypt(encrypted);
 * ```
 *
 * ### Environment Requirements
 *
 * - Node.js: Version 16+ recommended
 * - Built-in modules: crypto, zlib
 * - Not compatible with browser environments
 *
 * @see {@link https://github.com/qlover/fe-base/tree/main/packages/corekit-node} for detailed documentation
 */
export * from './encrypt';
