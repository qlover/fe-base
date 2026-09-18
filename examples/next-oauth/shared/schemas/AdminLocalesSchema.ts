import { i18nKeySchema } from '@qlover/next-kit/common';
import { z } from 'zod';
import { i18nConfig, type LocaleType } from '@config/i18n';

const localeEnum = z.enum(
  i18nConfig.supportedLngs as unknown as [LocaleType, ...LocaleType[]]
);

/** One row for one locale (Prisma-style single-language admin list). */
export const adminLocaleItemSchema = z.object({
  id: z.number().int(),
  value: z.string(),
  namespace: z.string(),
  description: z.string(),
  locale: localeEnum,
  text: z.string(),
  updated_at: z.union([z.string(), z.number()]).optional()
});

export type AdminLocaleItem = z.infer<typeof adminLocaleItemSchema>;

export const adminLocaleCreateSchema = z.object({
  value: i18nKeySchema,
  locale: localeEnum,
  text: z.string().default(''),
  description: z.string().optional(),
  namespace: z.string().min(1).optional()
});

export type AdminLocaleCreate = z.infer<typeof adminLocaleCreateSchema>;

export const adminLocaleUpdateSchema = z.object({
  id: z.number().int().positive(),
  locale: localeEnum,
  text: z.string().optional(),
  description: z.string().optional()
});

export type AdminLocaleUpdate = z.infer<typeof adminLocaleUpdateSchema>;

export const adminLocalesImportResultSchema = z.object({
  totalCount: z.number().int(),
  successCount: z.number().int(),
  failureCount: z.number().int()
});

export type AdminLocalesImportResult = z.infer<
  typeof adminLocalesImportResultSchema
>;

export function isSupportedAdminLocale(value: string): value is LocaleType {
  return (i18nConfig.supportedLngs as readonly string[]).includes(value);
}
