import { type SerializerIneterface } from './SerializerIneterface';

/**
 * Configuration options for JSONSerializer
 *
 * Provides customization options for JSON serialization behavior,
 * including formatting, indentation, and custom transformation logic.
 *
 * @example Basic configuration
 * ```typescript
 * const options: JSONSerializerOptions = {
 *   pretty: true,
 *   indent: 2
 * };
 * ```
 */
export interface JSONSerializerOptions {
  /**
   * Enable pretty printing of JSON output
   *
   * When enabled, adds automatic indentation and line breaks for better
   * readability. Useful for configuration files, debugging, or human-readable output.
   *
   * @default `false`
   * @since `1.0.10`
   *
   * @example
   * ```typescript
   * const serializer = new JSONSerializer({ pretty: true });
   * serializer.serialize({ name: 'John', age: 30 });
   * // Result:
   * // {
   * //   "name": "John",
   * //   "age": 30
   * // }
   * ```
   */
  pretty?: boolean;

  /**
   * Number of spaces to use for indentation when pretty printing
   *
   * Only used when `pretty` is `true`. Controls the indentation level
   * for nested objects and arrays.
   *
   * @default `2`
   * @since `1.0.10`
   *
   * @example
   * ```typescript
   * const serializer = new JSONSerializer({ pretty: true, indent: 4 });
   * serializer.serialize({ user: { name: 'John' } });
   * // Result:
   * // {
   * //     "user": {
   * //         "name": "John"
   * //     }
   * // }
   * ```
   */
  indent?: number;

  /**
   * Custom replacer function for JSON.stringify
   *
   * Allows custom transformation during serialization. The function is
   * automatically wrapped to handle line ending normalization.
   *
   * @since `1.0.10`
   *
   * @example Filter properties
   * ```typescript
   * const serializer = new JSONSerializer({
   *   replacer: (key, value) => {
   *     // Exclude password field
   *     if (key === 'password') return undefined;
   *     return value;
   *   }
   * });
   *
   * serializer.serialize({ name: 'John', password: 'secret' });
   * // Result: '{"name":"John"}'
   * ```
   *
   * @example Transform values
   * ```typescript
   * const serializer = new JSONSerializer({
   *   replacer: (key, value) => {
   *     // Convert dates to ISO strings
   *     if (value instanceof Date) return value.toISOString();
   *     return value;
   *   }
   * });
   * ```
   */
  replacer?: (this: unknown, key: string, value: unknown) => unknown;
}

/**
 * Enhanced JSON serialization implementation that combines standard JSON API with additional features
 *
 * Why implement both Serializer and JSON interfaces:
 * 1. Serializer interface provides a consistent API across different serialization formats
 * 2. JSON interface maintains compatibility with native JSON methods
 * 3. Allows seamless integration with both existing JSON code and new serialization patterns
 *
 * Enhanced capabilities beyond standard JSON:
 * 1. Cross-platform line ending normalization (\r\n -> \n)
 * 2. Built-in pretty printing configuration
 * 3. Default value support for failed deserialization
 * 4. Circular reference detection with clear error messages
 * 5. Type-safe interface with better TypeScript support
 *
 * Usage scenarios:
 * 1. Direct replacement for JSON global object
 * 2. Part of a pluggable serialization system
 * 3. Configuration file parsing with error handling
 * 4. Cross-platform data exchange
 *
 * @implements {SerializerIneterface<unknown, string>} - Generic serialization interface
 * @implements {JSON} - Standard JSON interface compatibility
 * @todo - If circular reference is detected, the error message is not very friendly, can use [flatted](https://www.npmjs.com/package/flatted) to improve it
 * @since 1.0.10
 *
 * @example
 * ```typescript
 * const serializer = new JSONSerializer({ pretty: true });
 *
 * // Using Serializer interface (with enhanced features)
 * const serialized = serializer.serialize({ name: "test" });
 * const deserialized = serializer.deserialize('invalid json', { fallback: true });
 *
 * // Using standard JSON API (maintains compatibility)
 * const json = serializer.stringify({ name: "test" });
 * const obj = serializer.parse(json);
 * ```
 *
 * @example
 *
 * `JSON.parse` may encounter errors, so we use `deserialize` method to handle them, set default value if needed
 *
 * ```typescript
 * const serializer = new JSONSerializer();
 * serializer.deserialize('invalid json', { fallback: true }); // returns { fallback: true }
 * ```
 *
 * @example
 * Or, use `JSONSerializer` replace native `JSON` methods
 *
 * ```typescript
 * const JSON = new JSONSerializer();
 *
 * JSON.stringify({ name: 'test' }); // same as JSON.stringify({ name: 'test' })
 * JSON.parse('{ "name": "test" }'); // same as JSON.parse('{ "name": "test" }')
 * ```
 */
export class JSONSerializer<
    T = unknown,
    Opt extends JSONSerializerOptions = JSONSerializerOptions
  >
  implements SerializerIneterface<T, string>, JSON
{
  /**
   * Implements Symbol.toStringTag to properly identify this class
   * Required by JSON interface
   *
   * When this object calls toString, it returns this value
   *
   * @example
   * ```typescript
   * const serializer = new JSONSerializer();
   * serializer.toString(); // returns '[object JSONSerializer]'
   * ```
   */
  public readonly [Symbol.toStringTag] = 'JSONSerializer';

  /**
   * Creates a new JSONSerializer instance
   *
   * @param options - Configuration options for serialization behavior
   *
   * @since `1.5.0`
   *
   * @example Default configuration
   * ```typescript
   * const serializer = new JSONSerializer();
   * // Uses default options: no pretty printing
   * ```
   *
   * @example Pretty printing
   * ```typescript
   * const serializer = new JSONSerializer({
   *   pretty: true,
   *   indent: 4
   * });
   * ```
   *
   * @example With custom replacer
   * ```typescript
   * const serializer = new JSONSerializer({
   *   replacer: (key, value) => {
   *     if (key.startsWith('_')) return undefined;
   *     return value;
   *   }
   * });
   * ```
   */
  constructor(
    /**
     * Options for JSONSerializer
     *
     * @default `{}`
     */
    protected options: Opt = {} as Opt
  ) {}

  /**
   * Creates a replacer function that handles line endings normalization
   *
   * Why normalize line endings:
   * 1. Ensures consistent output across different platforms (Windows, Unix)
   * 2. Prevents issues with source control systems
   * 3. Makes string comparisons reliable
   *
   * Handles three cases:
   * 1. Array replacer - Used for property filtering
   * 2. Function replacer - Wrapped to handle line endings
   * 3. Null/undefined - Creates default line ending handler
   *
   * @param replacer - Custom replacer function or array of properties to include
   * @returns Replacer function or array of properties to include
   *
   * @since `1.0.10`
   * @protected
   */
  protected createReplacer(
    replacer?:
      | ((this: unknown, key: string, value: unknown) => unknown)
      | (number | string)[]
      | null
  ):
    | ((this: unknown, key: string, value: unknown) => unknown)
    | (number | string)[]
    | null {
    // If it is an array type replacer, return it directly for property filtering
    if (Array.isArray(replacer)) {
      return replacer;
    }

    // If it is null, return the basic function that only handles line endings
    if (replacer === null) {
      return function (_key: string, val: unknown): unknown {
        return typeof val === 'string' ? val.replace(/\r\n/g, '\n') : val;
      };
    }

    // If it is a function, wrap it to add line ending processing capability
    if (typeof replacer === 'function') {
      return function (this: unknown, key: string, val: unknown): unknown {
        const normalized =
          typeof val === 'string' ? val.replace(/\r\n/g, '\n') : val;
        return replacer.call(this, key, normalized);
      };
    }

    // Default return the basic function that only handles line endings
    return function (_key: string, val: unknown): unknown {
      return typeof val === 'string' ? val.replace(/\r\n/g, '\n') : val;
    };
  }

  /**
   * Enhanced JSON.stringify with additional features
   *
   * Enhancements:
   * 1. Line ending normalization
   * 2. Configurable pretty printing
   * 3. Better error messages for circular references
   * 4. Type-safe replacer handling
   *
   * **If circular reference is detected, the error message is not very friendly, can use [flatted](https://www.npmjs.com/package/flatted) to improve it**
   *
   * @override
   * @param value - Value to serialize
   * @param replacer - Optional replacer function or property array
   * @param space - Optional indentation (number of spaces or string)
   * @returns Serialized JSON string
   *
   * @since `1.0.10`
   *
   * @example Basic usage
   * ```typescript
   * const serializer = new JSONSerializer();
   * const json = serializer.stringify({ name: 'John', age: 30 });
   * // Result: '{"name":"John","age":30}'
   * ```
   *
   * @example With pretty printing
   * ```typescript
   * const json = serializer.stringify({ name: 'John' }, null, 2);
   * // Result:
   * // {
   * //   "name": "John"
   * // }
   * ```
   */
  public stringify(
    value: unknown,
    replacer?:
      | ((this: unknown, key: string, value: unknown) => unknown)
      | (number | string)[]
      | null,
    space?: string | number
  ): string {
    try {
      const customReplacer = this.createReplacer(replacer);

      // Call different overloads based on replacer type to maintain type safety
      if (Array.isArray(customReplacer)) {
        return JSON.stringify(value, customReplacer, space);
      }

      return JSON.stringify(
        value,
        customReplacer as
          | ((this: unknown, key: string, value: unknown) => unknown)
          | undefined,
        space ?? (this.options.pretty ? this.options.indent || 2 : undefined)
      );
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('circular')) {
        throw new TypeError('Cannot stringify data with circular references');
      }
      throw error;
    }
  }

  /**
   * Standard JSON.parse implementation
   *
   * Parses a JSON string and returns the corresponding JavaScript value.
   * Error handling is done in the `deserialize` method.
   *
   * @override
   * @param text - JSON string to parse
   * @param reviver - Optional function to transform parsed values
   * @returns Parsed JavaScript value
   *
   * @since `1.0.10`
   *
   * @example
   * ```typescript
   * const serializer = new JSONSerializer();
   * const obj = serializer.parse('{"name":"John"}');
   * // Result: { name: 'John' }
   * ```
   */
  public parse(
    text: string,
    reviver?: (this: unknown, key: string, value: unknown) => unknown
  ): unknown {
    return JSON.parse(text, reviver);
  }

  /**
   * Implements Serializer.serialize
   *
   * Provides a simplified interface with configured options.
   * Uses the instance's configuration for pretty printing and replacer.
   *
   * Benefits:
   * 1. Uses configured pretty printing
   * 2. Applies custom replacer if specified
   * 3. Maintains consistent line endings
   *
   * @override
   * @param data - Data to serialize
   * @returns Serialized JSON string
   *
   * @since `1.0.10`
   *
   * @example
   * ```typescript
   * const serializer = new JSONSerializer({ pretty: true });
   * const json = serializer.serialize({ name: 'John' });
   * ```
   */
  public serialize(data: unknown): string {
    return this.stringify(
      data,
      this.options.replacer || null,
      this.options.pretty ? this.options.indent || 2 : undefined
    );
  }

  /**
   * Implements Serializer.deserialize with enhanced error handling
   *
   * Safely parses JSON string with automatic error handling. Returns
   * default value if parsing fails instead of throwing an error.
   *
   * Benefits:
   * 1. Safe parsing with default value fallback
   * 2. No try-catch needed in calling code
   * 3. Predictable error handling
   *
   * @override
   * @param data - JSON string to deserialize
   * @param defaultValue - Optional default value if parsing fails
   * @returns Parsed value or default value
   *
   * @since `1.0.10`
   *
   * @example Safe parsing
   * ```typescript
   * const serializer = new JSONSerializer();
   * const obj = serializer.deserialize('invalid json', { name: 'Default' });
   * // Result: { name: 'Default' }
   * ```
   */
  public deserialize(data: string, defaultValue?: T): T {
    try {
      return this.parse(data) as T;
    } catch {
      return defaultValue as T;
    }
  }

  /**
   * Optimized serialization for arrays of primitive values
   *
   * Provides faster serialization for arrays containing only primitives
   * by avoiding object property enumeration and using direct array mapping.
   *
   * Performance benefits:
   * - Faster than standard `JSON.stringify` for primitive arrays
   * - Avoids object property enumeration overhead
   * - Direct string concatenation
   *
   * @param arr - Array of primitive values to serialize
   * @returns JSON array string
   *
   * @since `1.0.10`
   *
   * @example
   * ```typescript
   * const serializer = new JSONSerializer();
   * const json = serializer.serializeArray([1, 2, 'test', true]);
   * // Result: '[1,2,"test",true]'
   * ```
   */
  public serializeArray(arr: (string | number | boolean)[]): string {
    // Use explicit type for Array.prototype.map
    const mapped = arr.map((value: string | number | boolean) =>
      JSON.stringify(value)
    );
    return '[' + mapped.join(',') + ']';
  }
}
