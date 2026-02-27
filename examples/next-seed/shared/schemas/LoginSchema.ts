import { z } from 'zod';
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
