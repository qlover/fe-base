import type { EncryptorInterface } from '@qlover/fe-corekit/encrypt';

function shouldMd5Password(): boolean {
  const flag = process.env.SUPABASE_LOGIN_PASSWORD_MD5?.trim().toLowerCase();
  return flag === '1' || flag === 'true' || flag === 'yes';
}

/**
 * Password actually stored in Supabase Auth. Sign-in and password updates
 * must both go through this, otherwise `SUPABASE_LOGIN_PASSWORD_MD5` makes
 * them disagree.
 */
export function resolveSupabaseLoginPassword(
  encryptor: EncryptorInterface<string, string>,
  password: string
): string {
  return shouldMd5Password() ? encryptor.encrypt(password) : password;
}
