import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExecutorError } from '@qlover/fe-corekit/executor';
import { AliyunSmsPhoneOtpProvider } from '@server/services/phoneOtp/AliyunSmsPhoneOtpProvider';
import { API_SMS_PROVIDER_NOT_READY } from '@config/i18n-identifier/api';
import type { SiteSettingsService } from '@server/services/SiteSettingsService';
import type { LoggerInterface } from '@qlover/logger';

describe('AliyunSmsPhoneOtpProvider', () => {
  const logger = {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  } as unknown as LoggerInterface;

  let settings: {
    getString: ReturnType<typeof vi.fn>;
    getSecretString: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    settings = {
      getString: vi.fn(async (key: string) => {
        const map: Record<string, string> = {
          'aliyun_sms.access_key_id': 'testid',
          'aliyun_sms.sign_name': '测试签名',
          'aliyun_sms.template_code': 'SMS_123',
          'aliyun_sms.template_param_key': 'code'
        };
        return map[key] ?? '';
      }),
      getSecretString: vi.fn(async () => 'testsecret')
    };
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ Code: 'OK', Message: 'OK' })
      }))
    );
  });

  it('rejects when credentials incomplete', async () => {
    settings.getString = vi.fn(async () => '');
    settings.getSecretString = vi.fn(async () => '');
    const provider = new AliyunSmsPhoneOtpProvider(
      logger,
      settings as unknown as SiteSettingsService
    );
    await expect(
      provider.send({
        phone: '+8613800138000',
        code: '123456',
        expiresAt: new Date()
      })
    ).rejects.toMatchObject({
      id: API_SMS_PROVIDER_NOT_READY
    } satisfies Partial<ExecutorError>);
  });

  it('sends with domestic phone stripped of +86', async () => {
    const provider = new AliyunSmsPhoneOtpProvider(
      logger,
      settings as unknown as SiteSettingsService
    );
    await provider.send({
      phone: '+8613800138000',
      code: '654321',
      expiresAt: new Date()
    });
    expect(fetch).toHaveBeenCalled();
    const calledUrl = String((fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]);
    expect(calledUrl).toContain('PhoneNumbers=13800138000');
    expect(calledUrl).toContain('Action=SendSms');
    expect(decodeURIComponent(calledUrl)).toContain('"code":"654321"');
  });

  it('does not expose plain code', () => {
    const provider = new AliyunSmsPhoneOtpProvider(
      logger,
      settings as unknown as SiteSettingsService
    );
    expect(provider.exposePlainCode()).toBe(false);
    expect(provider.name).toBe('aliyun');
  });
});
