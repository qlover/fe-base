/**
 * 站点设置持久化行（存储层视角）。
 */
export type SiteSettingStoreRowType = {
  readonly key: string;
  readonly value: unknown;
  readonly description?: string | null;
  readonly is_sensitive?: boolean;
};

/**
 * 站点设置写入行。
 */
export type SiteSettingUpsertInputType = {
  readonly key: string;
  readonly value: unknown;
  readonly description: string;
  readonly isSensitive: boolean;
};

/**
 * 站点设置存储契约（Repository 实现）。
 */
export interface SiteSettingsStoreInterface {
  getAll(): Promise<SiteSettingStoreRowType[]>;
  upsertMany(rows: readonly SiteSettingUpsertInputType[]): Promise<void>;
}
