/**
 * Isomorphic layer — safe in Node, Edge, and browser.
 *
 * Rules:
 * - Must NOT import from `../server` or `../browser`
 * - Prefer pure types, schemas, validators, and environment-agnostic helpers
 */

export const NEXT_KIT_COMMON = 'common' as const;
