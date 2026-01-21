/**
 * Checks if URL is absolute (starts with `http://` or `https://`)
 *
 * This utility function determines whether a URL string represents an absolute URL
 * that includes a protocol scheme. Absolute URLs can be used directly without
 * requiring a base URL for resolution.
 *
 * @param url - URL string to check
 * @returns `true` if URL is absolute, `false` otherwise
 *
 * @example
 * ```typescript
 * isAbsoluteUrl('https://api.example.com/users'); // true
 * isAbsoluteUrl('http://localhost:3000'); // true
 * isAbsoluteUrl('/users'); // false
 * isAbsoluteUrl('users'); // false
 * isAbsoluteUrl('//cdn.example.com/file.js'); // false
 * ```
 *
 * @since 3.0.0
 */
export function isAbsoluteUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}
