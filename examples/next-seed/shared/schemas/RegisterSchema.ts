import { z } from 'zod';
import {
  V_USERNAME_REQUIRED,
  V_EMAIL_INVALID,
  V_PASSWORD_MIN_LENGTH,
  V_PASSWORD_MAX_LENGTH,
  V_PASSWORD_SPECIAL_CHARS
} from '@config/i18n-identifier/common/validators';

export const registerUsernameSchema = z
  .string()
  .min(1, { message: V_USERNAME_REQUIRED });

export const registerEmailSchema = z.email({ message: V_EMAIL_INVALID });

export const registerPasswordSchema = z
  .string()
  .min(6, { message: V_PASSWORD_MIN_LENGTH })
  .max(50, { message: V_PASSWORD_MAX_LENGTH })
  .regex(/^\S+$/, { message: V_PASSWORD_SPECIAL_CHARS });

export const registerSchema = z.object({
  username: registerUsernameSchema,
  email: registerEmailSchema,
  password: registerPasswordSchema
});

export type RegisterSchema = z.infer<typeof registerSchema>;
