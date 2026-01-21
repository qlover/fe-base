import { type SerializerIneterface } from './SerializerIneterface';

/**
 * Base64 serialization implementation with cross-platform support
 *
 * Core concept:
 * Provides universal Base64 encoding/decoding that works consistently
 * across browser and Node.js environments, with automatic environment
 * detection and appropriate API usage.
 *
 * Main features:
 * - Cross-platform compatibility: Works in both browser and Node.js
 *   - Browser: Uses native `btoa`/`atob` with TextEncoder/TextDecoder
 *   - Node.js: Uses Buffer API for optimal performance
 *   - Automatic environment detection
 *   - Consistent behavior across platforms
 *
 * - UTF-8 support: Proper handling of Unicode characters
 *   - Supports all Unicode characters
 *   - Handles multi-byte characters correctly
 *   - Prevents encoding errors
 *
 * - URL-safe encoding: Optional URL-safe Base64 format
 *   - Replaces `+` with `-`
 *   - Replaces `/` with `_`
 *   - Removes padding `=` characters
 *   - Safe for use in URLs and filenames
 *
 * - Robust error handling: Graceful failure with default values
 *   - Validates Base64 format before decoding
 *   - Returns default value on error
 *   - No exceptions thrown
 *
 * Use cases:
 * - Data obfuscation: Hide data in plain sight
 * - URL encoding: Encode data for URL parameters
 * - Binary data: Encode binary data as text
 * - Storage: Store binary data in text-based storage
 *
 * @implements {SerializerIneterface<string, string>}
 *
 * @since `1.0.10`
 *
 * @example Basic usage
 * ```typescript
 * const serializer = new Base64Serializer();
 *
 * // Encode string to Base64
 * const encoded = serializer.serialize("Hello World!");
 * console.log(encoded); // "SGVsbG8gV29ybGQh"
 *
 * // Decode Base64 back to string
 * const decoded = serializer.deserialize(encoded);
 * console.log(decoded); // "Hello World!"
 * ```
 *
 * @example URL-safe encoding
 * ```typescript
 * const serializer = new Base64Serializer({ urlSafe: true });
 *
 * const data = "data+with/special=chars";
 * const encoded = serializer.serialize(data);
 * // URL-safe: no +, /, or = characters
 * console.log(encoded); // "ZGF0YSt3aXRoL3NwZWNpYWw9Y2hhcnM"
 * ```
 *
 * @example UTF-8 support
 * ```typescript
 * const serializer = new Base64Serializer();
 *
 * // Encode Unicode characters
 * const encoded = serializer.serialize("你好世界 🌍");
 * const decoded = serializer.deserialize(encoded);
 * console.log(decoded); // "你好世界 🌍"
 * ```
 *
 * @example Error handling
 * ```typescript
 * const serializer = new Base64Serializer();
 *
 * // Invalid Base64 returns default value
 * const result = serializer.deserialize('invalid!!!', 'fallback');
 * console.log(result); // "fallback"
 * ```
 */
export class Base64Serializer implements SerializerIneterface<string, string> {
  /**
   * Creates a new Base64Serializer instance
   *
   * @param options - Configuration options
   * @param {boolean} [options.urlSafe=false] - Use URL-safe Base64 encoding
   *
   * @example Standard encoding
   * ```typescript
   * const serializer = new Base64Serializer();
   * ```
   *
   * @example URL-safe encoding
   * ```typescript
   * const serializer = new Base64Serializer({ urlSafe: true });
   * ```
   */
  constructor(
    private options: {
      /**
       * Use URL-safe Base64 encoding
       *
       * When enabled:
       * - Replaces `+` with `-`
       * - Replaces `/` with `_`
       * - Removes padding `=` characters
       *
       * @default `false`
       * @since `1.0.10`
       */
      urlSafe?: boolean;
    } = {}
  ) {}

  /**
   * Detects if running in Node.js environment
   * @private
   * @returns True if in Node.js, false if in browser
   */
  private isNodeEnvironment(): boolean {
    return (
      typeof process !== 'undefined' &&
      process.versions &&
      !!process.versions.node
    );
  }

  /**
   * Validates if a string is a valid Base64 encoded string
   * @private
   * @param value - The string to validate
   * @returns True if valid Base64, false otherwise
   */
  private isValidBase64(value: string): boolean {
    try {
      // Check if string contains only valid Base64 characters
      const base64Regex = /^[A-Za-z0-9+/\-_]*={0,2}$/;
      if (!base64Regex.test(value)) {
        return false;
      }

      // Check if length is valid (must be multiple of 4 after padding)
      const normalizedValue = this.options.urlSafe
        ? this.makeUrlUnsafe(value)
        : value;
      if (normalizedValue.length % 4 !== 0) {
        return false;
      }

      // Try to decode to verify it's valid
      if (this.isNodeEnvironment()) {
        Buffer.from(normalizedValue, 'base64').toString('utf8');
      } else {
        atob(normalizedValue);
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Serializes string to Base64 using environment-appropriate method
   *
   * Automatically detects the environment and uses the optimal encoding method:
   * - Node.js: Uses Buffer API for better performance
   * - Browser: Uses btoa with TextEncoder for UTF-8 support
   *
   * @override
   * @param data - String to encode
   * @returns Base64 encoded string (empty string on error)
   *
   * @since `1.0.10`
   *
   * @example
   * ```typescript
   * const serializer = new Base64Serializer();
   * const encoded = serializer.serialize("Hello World!");
   * console.log(encoded); // "SGVsbG8gV29ybGQh"
   * ```
   */
  public serialize(data: string): string {
    try {
      let base64: string;

      if (this.isNodeEnvironment()) {
        // Node.js environment
        base64 = Buffer.from(data, 'utf8').toString('base64');
      } else {
        // Browser environment
        const utf8Bytes = new TextEncoder().encode(data);
        const binaryString = Array.from(utf8Bytes, (byte) =>
          String.fromCharCode(byte)
        ).join('');
        base64 = btoa(binaryString);
      }

      if (this.options.urlSafe) {
        return this.makeUrlSafe(base64);
      }
      return base64;
    } catch {
      // Return empty string on error for consistency
      return '';
    }
  }

  /**
   * Deserializes Base64 string back to original using environment-appropriate method
   *
   * Validates the Base64 format before decoding and returns default value
   * if validation or decoding fails. Automatically handles URL-safe format
   * conversion if configured.
   *
   * @override
   * @param data - Base64 string to decode
   * @param defaultValue - Optional default value if decoding fails
   * @returns Decoded string (default value on error)
   *
   * @since `1.0.10`
   *
   * @example
   * ```typescript
   * const serializer = new Base64Serializer();
   * const decoded = serializer.deserialize("SGVsbG8gV29ybGQh");
   * console.log(decoded); // "Hello World!"
   * ```
   *
   * @example With default value
   * ```typescript
   * const decoded = serializer.deserialize("invalid", "fallback");
   * console.log(decoded); // "fallback"
   * ```
   */
  public deserialize(data: string, defaultValue?: string): string {
    try {
      // Input validation
      if (typeof data !== 'string') {
        return defaultValue ?? '';
      }

      if (data.length === 0) {
        return '';
      }

      // Validate Base64 format
      if (!this.isValidBase64(data)) {
        return defaultValue ?? '';
      }

      // Convert URL-safe to standard if needed
      let normalizedData = data;
      if (this.options.urlSafe) {
        normalizedData = this.makeUrlUnsafe(data);
      }

      if (this.isNodeEnvironment()) {
        // Node.js environment
        return Buffer.from(normalizedData, 'base64').toString('utf8');
      } else {
        // Browser environment
        const binaryString = atob(normalizedData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return new TextDecoder().decode(bytes);
      }
    } catch {
      return defaultValue ?? '';
    }
  }

  /**
   * Converts standard Base64 to URL-safe Base64
   *
   * Transformations:
   * - `+` → `-`
   * - `/` → `_`
   * - Remove trailing `=` padding
   *
   * @param base64 - Standard Base64 string
   * @returns URL-safe Base64 string
   *
   * @since `1.0.10`
   * @private
   *
   * @example
   * ```typescript
   * makeUrlSafe("Hello+World/Test==");
   * // Result: "Hello-World_Test"
   * ```
   */
  private makeUrlSafe(base64: string): string {
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  /**
   * Converts URL-safe Base64 back to standard Base64
   *
   * Transformations:
   * - `-` → `+`
   * - `_` → `/`
   * - Add `=` padding to make length multiple of 4
   *
   * @param safe - URL-safe Base64 string
   * @returns Standard Base64 string
   *
   * @since `1.0.10`
   * @private
   *
   * @example
   * ```typescript
   * makeUrlUnsafe("Hello-World_Test");
   * // Result: "Hello+World/Test=="
   * ```
   */
  private makeUrlUnsafe(safe: string): string {
    safe = safe.replace(/-/g, '+').replace(/_/g, '/');
    while (safe.length % 4) {
      safe += '=';
    }
    return safe;
  }
}
