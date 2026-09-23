import { z } from 'zod';

export const otpMonitorAdminEntrySchema = z.object({
  key: z.string(),
  ip: z.string(),
  blockedUntilMs: z.number().nullable(),
  ttlMs: z.number().nullable(),
  value: z.unknown()
});

export type OtpMonitorAdminEntry = z.infer<typeof otpMonitorAdminEntrySchema>;

export const otpMonitorListResultSchema = z.object({
  entries: z.array(otpMonitorAdminEntrySchema),
  total: z.number().int().nonnegative()
});

export type OtpMonitorListResult = z.infer<typeof otpMonitorListResultSchema>;

export const otpMonitorPurgeSchema = z
  .object({
    key: z.string().trim().min(1).optional(),
    all: z.boolean().optional()
  })
  .refine((value) => Boolean(value.all || value.key), {
    message: 'Specify key or all'
  });

export type OtpMonitorPurgeBody = z.infer<typeof otpMonitorPurgeSchema>;

export const otpMonitorPurgeResultSchema = z.object({
  removed: z.number().int().nonnegative()
});

export type OtpMonitorPurgeResult = z.infer<typeof otpMonitorPurgeResultSchema>;
