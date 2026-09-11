import { describe, expect, it } from 'vitest';
import { UserRole, userSchema } from '../src/common/schemas/UserSchema';

const base = {
  id: 'user-1',
  role: UserRole.USER,
  credential_token: 'tok',
  created_at: '2026-01-01T00:00:00.000Z'
};

describe('userSchema', () => {
  it('accepts a valid business email', () => {
    const parsed = userSchema.parse({
      ...base,
      email: 'a@example.com'
    });
    expect(parsed.email).toBe('a@example.com');
  });

  it('accepts empty email for phone-only accounts', () => {
    const parsed = userSchema.parse({
      ...base,
      email: '',
      phone: '+8613800138000',
      name: '用户****8000'
    });
    expect(parsed.email).toBe('');
    expect(parsed.phone).toBe('+8613800138000');
    expect(parsed.name).toBe('用户****8000');
  });

  it('rejects invalid non-empty email', () => {
    expect(() =>
      userSchema.parse({
        ...base,
        email: 'not-an-email'
      })
    ).toThrow();
  });
});
