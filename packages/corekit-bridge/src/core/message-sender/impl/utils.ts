/**
 * Simple template string interpolation utility
 *
 * Replaces placeholders in the format `${key}` with values from the provided
 * data object. If a key is not found in the data object, the placeholder is
 * left unchanged.
 *
 * @param template - Template string containing `${key}` placeholders
 * @param data - Object with key-value pairs for interpolation
 * @returns Interpolated string with placeholders replaced by values
 *
 * @example Basic usage
 * ```typescript
 * const result = template('Hello, ${name}!', { name: 'Alice' });
 * console.log(result); // "Hello, Alice!"
 * ```
 *
 * @example Multiple placeholders
 * ```typescript
 * const message = template(
 *   'User ${userId} sent ${count} messages',
 *   { userId: 123, count: 5 }
 * );
 * console.log(message); // "User 123 sent 5 messages"
 * ```
 *
 * @example With boolean values
 * ```typescript
 * const status = template(
 *   'Active: ${isActive}',
 *   { isActive: true }
 * );
 * console.log(status); // "Active: true"
 * ```
 *
 * @example Missing keys preserved
 * ```typescript
 * const result = template(
 *   'Hello, ${name}! Age: ${age}',
 *   { name: 'Bob' }
 * );
 * console.log(result); // "Hello, Bob! Age: ${age}"
 * ```
 */
export function template(
  template: string,
  data: Record<string, string | number | boolean>
): string {
  return template.replace(
    /\${(\w+)}/g,
    (match, key) => String(data[key]) || match
  );
}
