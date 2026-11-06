import { injectable } from '@shared/container';
import { createAdminClient } from '@shared/supabase/server';
import { FeTables } from '@config/feTables';
import {
  adminOverviewMetricsSchema,
  type AdminOverviewFailuresType,
  type AdminOverviewMetricsType,
  type AdminOverviewTrendGranularityType,
  type AdminOverviewTrendType
} from '@schemas/AdminOverviewSchema';
import type { SupabaseClient } from '@supabase/supabase-js';

type TrendRowType = {
  readonly bucket: string;
  readonly active_users: number | string;
  readonly signups: number | string;
};

type FailureRowType = {
  readonly event_category: string;
  readonly event_type: string;
  readonly failures: number | string;
  readonly last_at: string;
};

/**
 * Admin 概览统计读取（service role；聚合走 `fe_admin_overview_*` 函数）。
 */
@injectable()
export class AdminOverviewRepository {
  /**
   * @returns [from, to) 区间内各项计数
   */
  public async fetchMetrics(
    from: Date,
    to: Date
  ): Promise<AdminOverviewMetricsType> {
    const response = await this.client().rpc('fe_admin_overview_metrics', {
      p_from: from.toISOString(),
      p_to: to.toISOString()
    });
    if (response.error) {
      throw new Error(
        `admin overview metrics failed: ${response.error.message}`
      );
    }
    return adminOverviewMetricsSchema.parse(response.data);
  }

  /**
   * @param timeZone - IANA 时区，分桶按该时区本地时刻
   * @returns 连续分桶（空桶为 0）
   */
  public async fetchTrend(
    from: Date,
    to: Date,
    granularity: AdminOverviewTrendGranularityType,
    timeZone: string
  ): Promise<AdminOverviewTrendType['points']> {
    const response = await this.client().rpc('fe_admin_overview_trend', {
      p_from: from.toISOString(),
      p_to: to.toISOString(),
      p_bucket: granularity,
      p_tz: timeZone
    });
    if (response.error) {
      throw new Error(`admin overview trend failed: ${response.error.message}`);
    }
    return ((response.data ?? []) as TrendRowType[]).map((row) => ({
      bucket: String(row.bucket).replace(' ', 'T').slice(0, 16),
      activeUsers: Number(row.active_users),
      signups: Number(row.signups)
    }));
  }

  /**
   * @returns 自 `since` 起失败请求按 event_category + event_type 汇总
   */
  public async fetchFailureGroups(
    since: Date,
    limit: number
  ): Promise<AdminOverviewFailuresType['top']> {
    const response = await this.client().rpc('fe_admin_overview_failures', {
      p_since: since.toISOString(),
      p_limit: limit
    });
    if (response.error) {
      throw new Error(
        `admin overview failures failed: ${response.error.message}`
      );
    }
    return ((response.data ?? []) as FailureRowType[]).map((row) => ({
      category: row.event_category,
      type: row.event_type,
      count: Number(row.failures),
      lastAt: row.last_at
    }));
  }

  /**
   * @returns [from, to) 区间失败请求条数
   */
  public async countFailures(from: Date, to: Date): Promise<number> {
    const response = await this.client()
      .from(FeTables.requestLogs)
      .select('id', { count: 'exact', head: true })
      .eq('success', false)
      .gte('created_at', from.toISOString())
      .lt('created_at', to.toISOString());
    if (response.error) {
      throw new Error(
        `admin overview failure count failed: ${response.error.message}`
      );
    }
    return response.count ?? 0;
  }

  protected client(): SupabaseClient {
    return createAdminClient();
  }
}
