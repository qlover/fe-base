/**
 * @module Factory
 * @description Type-safe factory function for class and function instantiation
 *
 * This module provides a flexible factory function that can handle both
 * class constructors and factory functions with proper type inference.
 *
 * Core Features:
 * - Type-safe instantiation
 * - Support for both classes and functions
 * - Argument type inference
 * - Runtime constructor detection
 *
 * @example Basic usage
 * ```typescript
 * // Class-based
 * class MyClass {
 *   constructor(name: string, value: number) {}
 * }
 *
 * const instance = factory(MyClass, 'test', 42);
 *
 * // Function-based
 * function createObject(config: { option: string }) {
 *   return { ...config };
 * }
 *
 * const object = factory(createObject, { option: 'value' });
 * ```
 */

/**
 * Combined type for class constructors and factory functions
 *
 * Represents either a class constructor or a factory function
 * with proper typing for arguments and return value.
 *
 * @template T - Return type
 * @template Args - Tuple type for arguments
 *
 * @example Class constructor
 * ```typescript
 * class MyClass {
 *   constructor(name: string) {}
 * }
 *
 * const ctor: ConstructorType<MyClass, [string]> = MyClass;
 * ```
 *
 * @example Factory function
 * ```typescript
 * interface Config {
 *   option: string;
 * }
 *
 * const factory: ConstructorType<Config, [string]> =
 *   (option: string) => ({ option });
 * ```
 */
export type ConstructorType<T, Args extends unknown[]> =
  | (new (...args: Args) => T)
  | ((...args: Args) => T);

/**
 * Creates instances from constructors or factory functions
 *
 * A flexible factory function that can handle both class constructors
 * and factory functions. It automatically detects the type at runtime
 * and uses the appropriate instantiation method.
 *
 * Features:
 * - Automatic constructor detection
 * - Type-safe argument passing
 * - Support for both classes and functions
 * - Generic type inference
 *
 * @template T - Return type
 * @template Args - Tuple type for arguments
 * @param Constructor - Class constructor or factory function
 * @param args - Arguments to pass to constructor/function
 * @returns Instance of type T
 *
 * @example Class instantiation
 * ```typescript
 * class Logger {
 *   constructor(name: string, level: string) {
 *     // Implementation
 *   }
 * }
 *
 * const logger = factory(Logger, 'main', 'debug');
 * ```
 *
 * @example Factory function
 * ```typescript
 * interface Config {
 *   name: string;
 *   options: Record<string, unknown>;
 * }
 *
 * function createConfig(name: string, options = {}): Config {
 *   return { name, options };
 * }
 *
 * const config = factory(createConfig, 'myConfig', { debug: true });
 * ```
 *
 * @example Generic types
 * ```typescript
 * class Container<T> {
 *   constructor(value: T) {
 *     // Implementation
 *   }
 * }
 *
 * const container = factory<Container<string>, [string]>(
 *   Container,
 *   'value'
 * );
 * ```
 */
export function factory<T, Args extends unknown[]>(
  Constructor: ConstructorType<T, Args>,
  ...args: Args
): T {
  // Check if Constructor is a class constructor by verifying:
  // 1. It's a function
  // 2. It has a prototype
  // 3. The prototype's constructor points back to itself
  // This distinguishes classes from regular functions
  if (
    typeof Constructor === 'function' &&
    Constructor.prototype &&
    Constructor.prototype.constructor === Constructor
  ) {
    // For class constructors, create a new instance with 'new'
    return new (Constructor as new (...args: Args) => T)(...args);
  }

  // For regular factory functions, call them directly
  // This branch handles both traditional functions and arrow functions
  return (Constructor as (...args: Args) => T)(...args);
}
