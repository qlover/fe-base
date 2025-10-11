import { z } from 'zod';

export const localesSchema = z.object({
  id: z.number(),
  description: z.string(),
  en: z.string(),
  zh: z.string(),
  created_at: z.number(),
  updated_at: z.number()
});

export type LocalesSchema = z.infer<typeof localesSchema>;
