import { z } from 'zod';

/** Same rules as the login password: 6–50 chars, no whitespace. */
export const PASSWORD_PATTERN = /^\S{6,50}$/;

export function isValidPassword(value: string): boolean {
  return PASSWORD_PATTERN.test(value);
}

/** POST /api/user/password — both fields arrive encrypted and are decrypted server-side. */
export const changePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().regex(PASSWORD_PATTERN)
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
