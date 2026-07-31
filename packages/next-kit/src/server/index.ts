/**
 * Server / Node / Next.js route-handler layer.
 *
 * Rules:
 * - May import from `../common`
 * - Must NOT import from `../browser`
 * - May use Node APIs, `next/server`, cookies, headers, etc.
 */

export { NEXT_KIT_COMMON } from '../common';

export const NEXT_KIT_SERVER = 'server' as const;
