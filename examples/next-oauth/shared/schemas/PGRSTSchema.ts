import { z } from 'zod';

export const pgrstSchema = z.object({
  code: z.string(),
  details: z.string(),
  hint: z.string().nullable(),
  message: z.string()
});

export type PGRSTSchema = z.infer<typeof pgrstSchema>;

export function isPGRSTSchema(value: unknown): value is PGRSTSchema {
  return pgrstSchema.safeParse(value).success;
}
