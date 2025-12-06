/**
 * First letter uppercase
 *
 * @example
 * ```typescript
 * firstUppercase('hello') // 'Hello'
 * firstUppercase('hELLO') // 'HELLO'
 * firstUppercase('hello world') // 'Hello world'
 * firstUppercase('hello-world') // 'Hello-world'
 * ```
 *
 * @param str - The string to convert
 * @returns The converted string
 */
export function firstUppercase<S extends string>(
  str: S
): FirstUppercaseType<S> {
  return (str.charAt(0).toUpperCase() + str.slice(1)) as FirstUppercaseType<S>;
}

/**
 * Capitalize first letter of a string type
 * Same behavior as firstUppercase function: only first letter uppercase, rest unchanged
 */
export type FirstUppercaseType<S extends string> =
  S extends `${infer First}${infer Rest}` ? `${Uppercase<First>}${Rest}` : S;
