export function maskPhoneForDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) {
    return phone;
  }
  return `****${digits.slice(-4)}`;
}

/**
 * UI / OIDC `name` label: name → masked phone → email → short id.
 */
export function resolveUserDisplayLabel(params: {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  userId?: string | null;
}): string {
  const name = params.name?.trim();
  if (name) {
    return name;
  }
  const phone = params.phone?.trim();
  if (phone) {
    return maskPhoneForDisplay(phone);
  }
  const email = params.email?.trim();
  if (email) {
    return email;
  }
  const id = params.userId?.trim() ?? '';
  if (id.length <= 12) {
    return id || 'User';
  }
  return `${id.slice(0, 8)}…`;
}
