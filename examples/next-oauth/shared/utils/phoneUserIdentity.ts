/** Internal Supabase placeholder for phone-only auth.users (not a business email). */
export const PHONE_PLACEHOLDER_EMAIL_SUFFIX = '@phone.next-oauth.local';

export function isPhonePlaceholderEmail(
  email: string | null | undefined
): boolean {
  if (!email?.trim()) {
    return false;
  }
  return email.trim().toLowerCase().endsWith(PHONE_PLACEHOLDER_EMAIL_SUFFIX);
}

export function phonePlaceholderEmail(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits
    ? `${digits}${PHONE_PLACEHOLDER_EMAIL_SUFFIX}`
    : `unknown${PHONE_PLACEHOLDER_EMAIL_SUFFIX}`;
}

/** Default display_name for phone-only profiles, e.g. 用户****8000 */
export function defaultDisplayNameFromPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const tail = digits.slice(-4) || '????';
  return `用户****${tail}`;
}

export function normalizePhoneE164(raw: string): string {
  const trimmed = raw.trim().replace(/[\s-]/g, '');
  if (!trimmed) {
    return '';
  }
  if (trimmed.startsWith('+')) {
    return `+${trimmed.slice(1).replace(/\D/g, '')}`;
  }
  const digits = trimmed.replace(/\D/g, '');
  if (/^1\d{10}$/.test(digits)) {
    return `+86${digits}`;
  }
  if (digits.startsWith('86') && digits.length >= 12) {
    return `+${digits}`;
  }
  return digits ? `+86${digits}` : '';
}
