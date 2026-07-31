import { z } from 'zod';
import { COMMON_I18N_KEY_INVALID } from '../config/i18nIdentifiers';
import { I18N_KEY_PATTERN } from './i18nKey';

/**
 * Zod schema for server / shared validators.
 * Client paths should use {@link isI18nKey} from `./i18nKey` instead.
 */
export const i18nKeySchema = z
  .string()
  .regex(I18N_KEY_PATTERN, COMMON_I18N_KEY_INVALID);

export type I18nKeySchema = z.infer<typeof i18nKeySchema>;

export {
  I18N_KEY_PATTERN,
  isI18nKey,
  joinI18nKey,
  splitI18nKey
} from './i18nKey';
