/**
 * Isomorphic layer — safe in Node, Edge, and browser.
 *
 * Rules:
 * - Must NOT import from `../server` or `../client`
 * - Prefer pure types, schemas, validators, and environment-agnostic helpers
 */

export { NEXT_KIT_COMMON } from './markers';

export { assertReflectMetadata } from './container';
export { InversifyContainer } from './container/InversifyContainer';

export { cookiesConfig } from './config/cookies';
export type { CookieAttributes } from './config/cookies';
export {
  defaultSearchParams,
  loginProviders,
  resolveSupabaseOAuthProvider
} from './config/defaults';
export type { LoginProviderType } from './config/defaults';
export * from './config/i18nIdentifiers';

export { SUPABASE_URL, SUPABASE_KEY } from './supabase/conts';

export { StringEncryptor } from './StringEncryptor';
export { Datetime } from './utils/Datetime';

export * from './interfaces/NextKitApi';
export * from './interfaces/I18nServiceInterface';
export * from './interfaces/RouterInterface';

export * from './schemas/common';
export * from './schemas/LoginSchema';
export * from './schemas/RegisterSchema';
export * from './schemas/UserSchema';
export * from './schemas/PGRSTSchema';
export * from './schemas/i18nKey';
export * from './schemas/i18nKeySchema';
export * from './schemas/LocalesSchema';
export * from './schemas/SearchParamsSchema';
export * from './schemas/SearchResultSchema';
export * from './schemas/RequestLogSchema';

export * from './validators/ValidatorInterface';
export { LoginValidator } from './validators/LoginValidator';
export { RegisterValidator } from './validators/RegisterValidator';
export { SearchParamsValidator } from './validators/SearchParamsValidator';
