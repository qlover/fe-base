import { z } from 'zod';

export const memoryKvAdminEntrySchema = z.object({
  key: z.string(),
  value: z.unknown(),
  bytes: z.number().int().nonnegative(),
  expiresAtMs: z.number().nullable(),
  ttlMs: z.number().nullable()
});

export type MemoryKvAdminEntry = z.infer<typeof memoryKvAdminEntrySchema>;

export const memoryKvListResultSchema = z.object({
  entries: z.array(memoryKvAdminEntrySchema),
  total: z.number().int().nonnegative()
});

export type MemoryKvListResult = z.infer<typeof memoryKvListResultSchema>;

export const memoryKvPurgeSchema = z
  .object({
    key: z.string().trim().min(1).optional(),
    prefix: z.string().trim().min(1).optional(),
    all: z.boolean().optional()
  })
  .refine((value) => Boolean(value.all || value.key || value.prefix), {
    message: 'Specify key, prefix, or all'
  });

export type MemoryKvPurgeBody = z.infer<typeof memoryKvPurgeSchema>;

export const memoryKvPurgeResultSchema = z.object({
  removed: z.number().int().nonnegative()
});

export type MemoryKvPurgeResult = z.infer<typeof memoryKvPurgeResultSchema>;
