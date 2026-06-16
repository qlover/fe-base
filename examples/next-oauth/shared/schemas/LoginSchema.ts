import { z } from 'zod';
import { loginProviders } from '@config/common';
import {
  V_EMAIL_INVALID,
  V_PASSWORD_MIN_LENGTH,
  V_PASSWORD_MAX_LENGTH,
  V_PASSWORD_SPECIAL_CHARS
} from '@config/i18n-identifier/common/validators';

export const loginEmailSchema = z.email({ message: V_EMAIL_INVALID });

export const loginPasswordSchema = z
  .string()
  .min(6, { message: V_PASSWORD_MIN_LENGTH })
  .max(50, { message: V_PASSWORD_MAX_LENGTH })
  .regex(/^\S+$/, { message: V_PASSWORD_SPECIAL_CHARS });

export const loginSchema = z.object({
  email: loginEmailSchema,
  password: loginPasswordSchema
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const loginWithProviderSchema = z.object({
  provider: z.enum(Object.values(loginProviders))
});

export const loginWithProviderCallbackSchema = z.object({
  code: z.string(),
  next: z.string().optional(),
  origin: z.string().optional()
});

export type LoginWithProviderCallbackSchema = z.infer<
  typeof loginWithProviderCallbackSchema
>;

export type LoginWithProviderSchema = z.infer<typeof loginWithProviderSchema>;
