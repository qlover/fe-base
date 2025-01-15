/**
 * Adjusts the expiration time based on the provided `expiresIn` value.
 * 
 * @param {number} baseTime - The base time in milliseconds to adjust.
 * @returns {number} - The adjusted time in milliseconds.
 * 
 * @example
 * const adjustedTime = userController.adjustExpirationTime(Date.now());
 */
export function adjustExpirationTime(baseTime: number, expiresIn: number | 'day' | 'week' | 'month' | 'year'): number {
  const dayInMs = 24 * 60 * 60 * 1000;

  switch (expiresIn) {
    case 'day':
      return baseTime + dayInMs;
    case 'week':
      return baseTime + 7 * dayInMs;
    case 'month':
      return baseTime + 30 * dayInMs; // Approximation
    case 'year':
      return baseTime + 365 * dayInMs; // Approximation
    default:
      return baseTime + (typeof expiresIn === 'number' ? expiresIn : 30 * dayInMs);
  }
}