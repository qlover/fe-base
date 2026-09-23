import { z } from 'zod';

export const phoneOtpProviderSchema = z.enum(['memory', 'supabase', 'aliyun']);

export type PhoneOtpProviderName = z.infer<typeof phoneOtpProviderSchema>;

export const phoneOtpStatusSchema = z.enum([
  'pending',
  'verified',
  'expired',
  'revoked'
]);

export type PhoneOtpStatus = z.infer<typeof phoneOtpStatusSchema>;

export const phoneOtpAdminItemSchema = z.object({
  id: z.string().uuid(),
  phone: z.string(),
  code: z.string().nullable(),
  provider: phoneOtpProviderSchema,
  status: phoneOtpStatusSchema,
  attempts: z.number().int().nonnegative(),
  maxAttempts: z.number().int().positive(),
  expiresAt: z.string(),
  verifiedAt: z.string().nullable(),
  createdIp: z.string().nullable(),
  createdAt: z.string()
});

export type PhoneOtpAdminItem = z.infer<typeof phoneOtpAdminItemSchema>;

export type FePhoneOtpRow = {
  id: string;
  phone: string;
  code_hash: string;
  code_plain: string | null;
  provider: PhoneOtpProviderName;
  status: PhoneOtpStatus;
  attempts: number;
  max_attempts: number;
  expires_at: string;
  verified_at: string | null;
  created_ip: string | null;
  created_at: string;
};
