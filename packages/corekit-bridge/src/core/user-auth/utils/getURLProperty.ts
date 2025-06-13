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

    if (!queryString) {
      return '';
    }

    const params = new URLSearchParams(queryString);
    const rawValue = params.get(key);

    if (rawValue == null || rawValue === '') {
      return '';
    }

    // Decode and guard against malformed URI sequences
    try {
      return decodeURIComponent(rawValue);
    } catch {
      return '';
    }
  } catch (error) {
    console.warn('Failed to parse URL:', error);
    return '';
  }
}
