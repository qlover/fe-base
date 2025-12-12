import { SerializerIneterface } from './SerializerIneterface';

/**
 * Base64 serialization implementation
 * Cross-platform string-to-base64 encoding/decoding for both browser and Node.js
 *
 * Significance: Provides universal Base64 serialization across different JavaScript environments
 * Core idea: Environment-aware Base64 encoding with consistent API
 * Main function: Convert strings to/from Base64 with optional URL-safe encoding
 * Main purpose: Enable cross-platform data serialization with Base64 encoding
 *
 * Features:
 * - Cross-platform compatibility (Browser + Node.js)
 * - Base64 encoding/decoding
 * - UTF-8 support
 * - URL-safe encoding option
 * - Robust error handling
 *
 * @implements {SerializerIneterface<string, string>}
 *
 * @since 1.0.10
 *
 * @example
 * ```typescript
 * const serializer = new Base64Serializer({ urlSafe: true });
 *
 * // Encode string to base64
 * const encoded = serializer.serialize("Hello World!");
 *
 * // Decode base64 back to string
 * const decoded = serializer.deserialize(encoded);
 * ```
 */
export class Base64Serializer implements SerializerIneterface<string, string> {
  constructor(
    private options: {
      /**
       * Use URL-safe base64 encoding
       * @default false
       *
       * @since 1.0.10
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
   * Serializes string to base64 using environment-appropriate method
   * @override
   * @since 1.0.10
   * @param data - String to encode
   * @returns Base64 encoded string
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
   * Deserializes base64 string back to original using environment-appropriate method
   * @override
   * @since 1.0.10
   * @param data - Base64 string to decode
   * @param defaultValue - Optional default value if decoding fails
   * @returns Decoded string
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
   * Converts standard base64 to URL-safe base64
   * @since 1.0.10
   * @param base64 - Standard base64 string
   * @returns URL-safe base64 string
   */
  private makeUrlSafe(base64: string): string {
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  /**
   * Converts URL-safe base64 back to standard base64
   * @private
   * @since 1.0.10
   * @param safe - URL-safe base64 string
   * @returns Standard base64 string
   */
  private makeUrlUnsafe(safe: string): string {
    safe = safe.replace(/-/g, '+').replace(/_/g, '/');
    while (safe.length % 4) {
      safe += '=';
    }
    return safe;
  }
}
