/**
 * Browser / client-component layer.
 *
 * Rules:
 * - May import from `../common`
 * - Must NOT import from `../server`
 * - Keep free of Node-only modules (`fs`, `next/headers`, etc.)
 */

export { NEXT_KIT_COMMON } from '../common';

export const NEXT_KIT_BROWSER = 'browser' as const;
