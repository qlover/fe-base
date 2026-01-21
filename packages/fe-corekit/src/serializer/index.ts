/**
 * @module Serializer
 * @description Data serialization and deserialization utilities
 *
 * This module provides utilities for converting data between different formats,
 * primarily for storage and transmission purposes. It includes JSON serialization
 * for complex objects and Base64 encoding for binary data or string obfuscation.
 *
 * Core functionality:
 * - JSON serialization: Convert objects to/from JSON strings
 *   - Type-safe serialization with generic support
 *   - Error handling for invalid JSON
 *   - Support for nested objects and arrays
 *   - Automatic type inference
 *
 * - Base64 encoding: Encode/decode strings to/from Base64
 *   - String obfuscation for simple data hiding
 *   - Binary data encoding
 *   - URL-safe encoding support
 *   - Automatic padding handling
 *
 * - Custom serializers: Extensible serialization interface
 *   - Implement custom serialization logic
 *   - Support for specialized data formats
 *   - Integration with storage systems
 *   - Type-safe serializer contracts
 *
 * ### Exported Members
 *
 * - `SerializerInterface`: Base interface for all serializers
 * - `JSONSerializer`: JSON serialization implementation
 * - `Base64Serializer`: Base64 encoding/decoding implementation
 *
 * ### Basic Usage
 *
 * ```typescript
 * import { JSONSerializer } from '@qlover/fe-corekit';
 *
 * const serializer = new JSONSerializer();
 *
 * // Serialize object to string
 * const user = { id: 1, name: 'John', email: 'john@example.com' };
 * const serialized = serializer.serialize(user);
 * // Result: '{"id":1,"name":"John","email":"john@example.com"}'
 *
 * // Deserialize string to object
 * const deserialized = serializer.deserialize(serialized);
 * console.log(deserialized); // { id: 1, name: 'John', email: 'john@example.com' }
 * ```
 *
 * ### Type-Safe Serialization
 *
 * ```typescript
 * import { JSONSerializer } from '@qlover/fe-corekit';
 *
 * interface User {
 *   id: number;
 *   name: string;
 *   email: string;
 * }
 *
 * const serializer = new JSONSerializer<User>();
 *
 * const user: User = {
 *   id: 1,
 *   name: 'John',
 *   email: 'john@example.com'
 * };
 *
 * // Type-safe serialization
 * const json = serializer.serialize(user);
 *
 * // Type-safe deserialization
 * const restored: User = serializer.deserialize(json);
 * ```
 *
 * ### Base64 Encoding
 *
 * ```typescript
 * import { Base64Serializer } from '@qlover/fe-corekit';
 *
 * const serializer = new Base64Serializer();
 *
 * // Encode string to Base64
 * const encoded = serializer.serialize('Hello, World!');
 * console.log(encoded); // 'SGVsbG8sIFdvcmxkIQ=='
 *
 * // Decode Base64 to string
 * const decoded = serializer.deserialize(encoded);
 * console.log(decoded); // 'Hello, World!'
 * ```
 *
 * ### Storage Integration
 *
 * ```typescript
 * import {
 *   SyncStorage,
 *   JSONSerializer
 * } from '@qlover/fe-corekit';
 *
 * // Create storage with JSON serializer
 * const storage = new SyncStorage(
 *   localStorage,
 *   new JSONSerializer()
 * );
 *
 * // Store complex objects
 * storage.set('config', {
 *   theme: 'dark',
 *   language: 'en',
 *   settings: {
 *     notifications: true,
 *     autoSave: false
 *   }
 * });
 *
 * // Retrieve with automatic deserialization
 * const config = storage.get('config');
 * ```
 *
 * ### Custom Serializer
 *
 * ```typescript
 * import { SerializerInterface } from '@qlover/fe-corekit';
 *
 * // Custom Date serializer
 * class DateSerializer implements SerializerInterface<Date> {
 *   serialize(data: Date): string {
 *     return data.toISOString();
 *   }
 *
 *   deserialize(data: string): Date {
 *     return new Date(data);
 *   }
 * }
 *
 * const serializer = new DateSerializer();
 * const now = new Date();
 * const serialized = serializer.serialize(now);
 * const restored = serializer.deserialize(serialized);
 * ```
 *
 * ### Compressed Serializer
 *
 * ```typescript
 * import {
 *   SerializerInterface,
 *   JSONSerializer
 * } from '@qlover/fe-corekit';
 *
 * class CompressedSerializer<T> implements SerializerInterface<T> {
 *   private jsonSerializer = new JSONSerializer<T>();
 *
 *   serialize(data: T): string {
 *     const json = this.jsonSerializer.serialize(data);
 *     // Apply compression algorithm
 *     return compress(json);
 *   }
 *
 *   deserialize(data: string): T {
 *     // Decompress first
 *     const json = decompress(data);
 *     return this.jsonSerializer.deserialize(json);
 *   }
 * }
 * ```
 *
 * ### Error Handling
 *
 * ```typescript
 * import { JSONSerializer } from '@qlover/fe-corekit';
 *
 * const serializer = new JSONSerializer();
 *
 * try {
 *   // Invalid JSON string
 *   const data = serializer.deserialize('invalid json');
 * } catch (error) {
 *   console.error('Deserialization failed:', error);
 * }
 * ```
 *
 * ### Nested Object Serialization
 *
 * ```typescript
 * import { JSONSerializer } from '@qlover/fe-corekit';
 *
 * interface ComplexData {
 *   user: {
 *     id: number;
 *     profile: {
 *       name: string;
 *       settings: {
 *         theme: string;
 *         notifications: boolean;
 *       };
 *     };
 *   };
 *   metadata: {
 *     created: string;
 *     updated: string;
 *   };
 * }
 *
 * const serializer = new JSONSerializer<ComplexData>();
 *
 * const data: ComplexData = {
 *   user: {
 *     id: 1,
 *     profile: {
 *       name: 'John',
 *       settings: {
 *         theme: 'dark',
 *         notifications: true
 *       }
 *     }
 *   },
 *   metadata: {
 *     created: '2024-01-01',
 *     updated: '2024-01-02'
 *   }
 * };
 *
 * const serialized = serializer.serialize(data);
 * const restored = serializer.deserialize(serialized);
 * ```
 *
 * @see {@link JSONSerializer} for JSON serialization
 * @see {@link Base64Serializer} for Base64 encoding
 * @see {@link SerializerInterface} for custom serializer implementation
 */
export * from './SerializerIneterface';
export * from './JSONSerializer';
export * from './Base64Serializer';
