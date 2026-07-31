import { z } from 'zod';
import { i18nKeySchema } from './i18nKeySchema';

export const localesSchema = z.object({
  id: z.number(),
  value: i18nKeySchema,
  en: z.string(),
  zh: z.string(),
  description: z.string(),
  namespace: z.string(),
  created_at: z.union([z.string(), z.number()]),
  updated_at: z.union([z.string(), z.number()])
});

export type LocalesSchema = z.infer<typeof localesSchema>;
