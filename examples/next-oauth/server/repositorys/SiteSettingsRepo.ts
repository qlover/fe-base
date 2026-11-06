import type {
  SiteSettingUpsertInputType,
  SiteSettingsStoreInterface
} from '@qlover/next-kit/server';
import { inject, injectable } from '@shared/container';
import { createAdminClient, createServerClient } from '@shared/supabase/server';
import { FeTables } from '@config/feTables';
import { I } from '@config/ioc-identifiter';
import type { FeSiteSettingRow } from '@schemas/FeSiteSettingsSchema';
import { FeSupabaseRepo } from './FeSupabaseRepo';
import type { LoggerInterface } from '@qlover/logger';

/** @deprecated 使用 kit {@link SiteSettingUpsertInputType} */
export type FeSiteSettingUpsertInput = SiteSettingUpsertInputType;

@injectable()
export class SiteSettingsRepo
  extends FeSupabaseRepo<FeSiteSettingRow>
  implements SiteSettingsStoreInterface
{
  constructor(@inject(I.Logger) logger: LoggerInterface) {
    super(FeTables.siteSettings, {
      logger,
      getUserClient: createServerClient,
      getAdminClient: createAdminClient
    });
  }

  public async getAll(): Promise<FeSiteSettingRow[]> {
    const result = await this.getAdminSupabase()
      .from(FeTables.siteSettings)
      .select('*');
    this.throwIfError(result);
    return (result.data ?? []) as FeSiteSettingRow[];
  }

  public async upsertMany(
    rows: readonly SiteSettingUpsertInputType[]
  ): Promise<void> {
    if (rows.length === 0) {
      return;
    }

    const payload = rows.map((row) => ({
      key: row.key,
      value: row.value,
      description: row.description,
      is_sensitive: row.isSensitive,
      updated_at: new Date().toISOString()
    }));

    const result = await this.getAdminSupabase()
      .from(FeTables.siteSettings)
      .upsert(payload, { onConflict: 'key' });
    this.throwIfError(result);
  }
}
