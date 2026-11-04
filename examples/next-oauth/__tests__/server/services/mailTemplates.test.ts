import { describe, expect, it } from 'vitest';
import {
  renderPasswordChangedMail,
  renderPasswordResetMail,
  renderTestMail
} from '@server/services/mail/mailTemplates';

describe('mailTemplates', () => {
  it('renders the reset mail with link and ttl in zh and en', () => {
    const url = 'https://example.com/zh/auth/reset-password?token=abc';

    const zh = renderPasswordResetMail({
      locale: 'zh',
      siteName: 'Site',
      resetUrl: url,
      expiresInMinutes: 30
    });
    const en = renderPasswordResetMail({
      locale: 'en',
      siteName: 'Site',
      resetUrl: url,
      expiresInMinutes: 30
    });

    expect(zh.text).toContain(url);
    expect(zh.text).toContain('30');
    expect(en.text).toContain(url);
    expect(zh.subject).not.toBe(en.subject);
    expect(zh.html).toContain('token=abc');
  });

  it('escapes html in the site name', () => {
    const mail = renderTestMail({ locale: 'en', siteName: '<b>x</b>' });

    expect(mail.html).not.toContain('<b>x</b>');
    expect(mail.html).toContain('&lt;b&gt;x&lt;/b&gt;');
  });

  it('renders the password changed notice', () => {
    const mail = renderPasswordChangedMail({
      locale: 'en',
      siteName: 'Site',
      changedAt: new Date('2026-01-02T03:04:05Z'),
      ip: '1.2.3.4',
      forgotPasswordUrl: 'https://example.com/en/auth/forgot-password'
    });

    expect(mail.subject.length).toBeGreaterThan(0);
    expect(mail.text).toContain('https://example.com/en/auth/forgot-password');
  });
});
