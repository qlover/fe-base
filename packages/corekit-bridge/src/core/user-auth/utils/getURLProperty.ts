/**
 * Extracts a parameter value from URL query string or hash
 *
 * @param href - The full URL string to parse
 * @param key - The parameter key to look for
 * @returns The parameter value if found, empty string otherwise
 */
export function getURLProperty(href: string, key: string): string {
  try {
    const queryString = href.split('?')[1];

    if (queryString) {
      return new URLSearchParams(queryString).get(key) || '';
    }

    return '';
  } catch (error) {
    console.warn('Failed to parse URL:', error);
    return '';
  }
}
