import { z } from 'zod';
import { i18nKeySchema } from '@config/i18n/i18nKeyScheam';

export const localesSchema = z.object({
  id: z.number(),
  value: i18nKeySchema,
  en: z.string(),
  zh: z.string(),
  description: z.string(),
  namespace: z.string(),
  created_at: z.union([z.string(), z.number()]), // Support both string (TIMESTAMPTZ) and number (Unix timestamp)
  updated_at: z.union([z.string(), z.number()]) // Support both string (TIMESTAMPTZ) and number (Unix timestamp)
});

export type LocalesSchema = z.infer<typeof localesSchema>;
