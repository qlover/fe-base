import { z } from 'zod';
import {
  FE_SITE_SETTING_KEYS,
  type FeCorsRule,
  type FeSiteSettingKey
} from '@config/feSiteSettings';
import {
  corsRuleSchema,
  corsValueSchema,
  type CorsValue
} from '@schemas/corsValueSchema';

export {
  corsOriginSchema,
  corsPathSchema,
  corsMethodSchema,
  corsRuleSchema,
  corsValueSchema,
  corsRuleIdentity,
  isValidCorsOriginValue,
  isValidCorsPathValue,
  type CorsRuleValue,
  type CorsValue
} from '@schemas/corsValueSchema';

export const feSiteSettingRowSchema = z.object({
  key: z.string(),
  value: z.unknown(),
  description: z.string(),
  is_sensitive: z.boolean(),
  updated_at: z.string()
});

export type FeSiteSettingRow = z.infer<typeof feSiteSettingRowSchema>;

export const fePublicConfigSchema = z.object({
  auth: z.object({
    phoneLoginEnabled: z.boolean(),
    /** `memory` | `supabase` (+ future SMS providers). */
    phoneOtpProvider: z.string(),
    githubOauthEnabled: z.boolean(),
    googleOauthEnabled: z.boolean()
  })
});

export type FePublicConfig = z.infer<typeof fePublicConfigSchema>;

/** @deprecated Use {@link corsRuleSchema} / {@link corsValueSchema}. */
export const feCorsRuleSchema = corsRuleSchema;

export const feAdminSiteSettingValueSchema = z.union([
  z.string(),
  z.boolean(),
  z.array(z.string()),
  corsValueSchema
]);

export const feAdminSiteSettingsPatchSchema = z.object({
  settings: z.record(z.string(), feAdminSiteSettingValueSchema)
});

export type FeAdminSiteSettingsPatch = z.infer<
  typeof feAdminSiteSettingsPatchSchema
>;

export type FeAdminSiteSettingEntry = {
  key: FeSiteSettingKey;
  label: string;
  description: string;
  value: string | boolean | string[] | FeCorsRule[];
  configured: boolean;
  isSensitive: boolean;
  source: 'db' | 'default';
};

export function isFeSiteSettingKey(key: string): key is FeSiteSettingKey {
  return Object.values(FE_SITE_SETTING_KEYS).includes(key as FeSiteSettingKey);
}

export function parseCorsValue(value: unknown): CorsValue {
  return corsValueSchema.parse(value);
}

export function safeParseCorsValue(value: unknown): CorsValue | null {
  const result = corsValueSchema.safeParse(value);
  return result.success ? result.data : null;
}
