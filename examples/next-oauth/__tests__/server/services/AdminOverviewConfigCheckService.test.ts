import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FE_SITE_SETTING_KEYS } from '@config/feSiteSettings';
import {
  AdminOverviewCheckKey,
  AdminOverviewCheckState
} from '@schemas/AdminOverviewSchema';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import type { SiteSettingsService } from '@server/services/SiteSettingsService';
import { AdminOverviewConfigCheckService } from '@server/services/admin-overview/AdminOverviewConfigCheckService';

describe('AdminOverviewConfigCheckService.check', () => {
  let getSecretString: ReturnType<typeof vi.fn>;
  let getString: ReturnType<typeof vi.fn>;
  let service: AdminOverviewConfigCheckService;

  beforeEach(() => {
    getSecretString = vi.fn();
    getString = vi.fn();
    service = new AdminOverviewConfigCheckService(
      {
        encryptionKey: '',
        openaiApiKey: ''
      } as SeedServerConfigInterface,
      {
        getSecretString,
        getString
      } as unknown as SiteSettingsService
    );
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it('warns when encryption / service role missing and Resend key absent', async () => {
    getSecretString.mockImplementation(async (key: string) => {
      if (key === FE_SITE_SETTING_KEYS.OPENAI_API_KEY) return '';
      if (key === FE_SITE_SETTING_KEYS.MAIL_RESEND_API_KEY) return '';
      return '';
    });
    getString.mockResolvedValue('resend');

    const checks = await service.check();
    const byKey = Object.fromEntries(checks.map((c) => [c.key, c.state]));

    expect(byKey[AdminOverviewCheckKey.encryptionKey]).toBe(
      AdminOverviewCheckState.warn
    );
    expect(byKey[AdminOverviewCheckKey.serviceRoleKey]).toBe(
      AdminOverviewCheckState.warn
    );
    expect(byKey[AdminOverviewCheckKey.openai]).toBe(
      AdminOverviewCheckState.off
    );
    expect(byKey[AdminOverviewCheckKey.mailProvider]).toBe(
      AdminOverviewCheckState.ok
    );
    expect(byKey[AdminOverviewCheckKey.mailResendApiKey]).toBe(
      AdminOverviewCheckState.warn
    );
  });
});
