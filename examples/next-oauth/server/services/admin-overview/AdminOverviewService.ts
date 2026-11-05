import { PermissionKey } from '@shared/auth/permissionKeys';
import { inject, injectable } from '@shared/container';
import type {
  AdminOverviewCheckType,
  AdminOverviewFailuresType,
  AdminOverviewRangeType,
  AdminOverviewType
} from '@schemas/AdminOverviewSchema';
import type { AdminOverviewServiceInterface } from '@server/interfaces/AdminOverviewServiceInterface';
import { AdminOverviewRepository } from '@server/repositorys/AdminOverviewRepository';
import { CurrentUserPermissionService } from '@server/services/CurrentUserPermissionService';
import { MemoryKvCacheService } from '@server/services/MemoryKvCacheService';
import { AdminOverviewConfigCheckService } from './AdminOverviewConfigCheckService';
import {
  ADMIN_OVERVIEW_TIME_ZONE,
  AdminOverviewRangeResolver
} from './AdminOverviewRangeResolver';

const CACHE_KEY_PREFIX = 'admin-overview:v1';
const CACHE_TTL_MS = 5 * 60_000;
const DAY_MS = 86_400_000;
const FAILURE_GROUP_LIMIT = 5;

type AdminOverviewSectionFlagsType = {
  readonly metrics: boolean;
  readonly failures: boolean;
  readonly checks: boolean;
};

type AdminOverviewStatsType = Pick<
  AdminOverviewType,
  'metrics' | 'trend' | 'failures'
>;

/**
 * Admin 首页概览编排：按权限裁剪模块；统计类缓存 5 分钟，checks 实时。
 */
@injectable()
export class AdminOverviewService implements AdminOverviewServiceInterface {
  constructor(
    @inject(CurrentUserPermissionService)
    protected readonly permissions: CurrentUserPermissionService,
    @inject(AdminOverviewRangeResolver)
    protected readonly rangeResolver: AdminOverviewRangeResolver,
    @inject(AdminOverviewRepository)
    protected readonly overviewRepository: AdminOverviewRepository,
    @inject(AdminOverviewConfigCheckService)
    protected readonly configCheck: AdminOverviewConfigCheckService,
    @inject(MemoryKvCacheService)
    protected readonly cache: MemoryKvCacheService
  ) {}

  /**
   * @override
   */
  public async load(range: AdminOverviewRangeType): Promise<AdminOverviewType> {
    const can = await this.permissions.createChecker();
    const flags: AdminOverviewSectionFlagsType = {
      metrics: can(PermissionKey.admin_users_read),
      failures: can(PermissionKey.admin_request_logs_read),
      checks: can(PermissionKey.admin_site_settings_read)
    };
    const now = new Date();

    const [stats, checks] = await Promise.all([
      this.loadStatsCached(range, flags, now),
      flags.checks
        ? this.configCheck.check()
        : Promise.resolve<AdminOverviewCheckType[] | null>(null)
    ]);

    return {
      range,
      generatedAt: now.toISOString(),
      ...stats,
      checks
    };
  }

  protected async loadStatsCached(
    range: AdminOverviewRangeType,
    flags: AdminOverviewSectionFlagsType,
    now: Date
  ): Promise<AdminOverviewStatsType> {
    const cacheKey = `${CACHE_KEY_PREFIX}:${String(range)}:${[
      flags.metrics,
      flags.failures
    ]
      .map((flag) => (flag ? '1' : '0'))
      .join('')}`;
    const cached = await this.cache.getItem<AdminOverviewStatsType>(cacheKey);
    if (cached) {
      return cached;
    }
    const stats = await this.loadStats(range, flags, now);
    await this.cache.setItem(cacheKey, stats, { ttlMs: CACHE_TTL_MS });
    return stats;
  }

  protected async loadStats(
    range: AdminOverviewRangeType,
    flags: AdminOverviewSectionFlagsType,
    now: Date
  ): Promise<AdminOverviewStatsType> {
    const windows = this.rangeResolver.resolve(range, now);
    const [current, previous, trendPoints, failures] = await Promise.all([
      flags.metrics
        ? this.overviewRepository.fetchMetrics(
            windows.current.from,
            windows.current.to
          )
        : Promise.resolve(null),
      flags.metrics
        ? this.overviewRepository.fetchMetrics(
            windows.previous.from,
            windows.previous.to
          )
        : Promise.resolve(null),
      flags.metrics
        ? this.overviewRepository.fetchTrend(
            windows.trend.from,
            windows.trend.to,
            windows.trend.granularity,
            ADMIN_OVERVIEW_TIME_ZONE
          )
        : Promise.resolve(null),
      flags.failures ? this.loadFailures(now) : Promise.resolve(null)
    ]);

    return {
      metrics: current && previous ? { current, previous } : null,
      trend: trendPoints
        ? { granularity: windows.trend.granularity, points: trendPoints }
        : null,
      failures
    };
  }

  protected async loadFailures(now: Date): Promise<AdminOverviewFailuresType> {
    const dayAgo = new Date(now.getTime() - DAY_MS);
    const twoDaysAgo = new Date(now.getTime() - 2 * DAY_MS);
    const [last24h, previous24h, top] = await Promise.all([
      this.overviewRepository.countFailures(dayAgo, now),
      this.overviewRepository.countFailures(twoDaysAgo, dayAgo),
      this.overviewRepository.fetchFailureGroups(dayAgo, FAILURE_GROUP_LIMIT)
    ]);
    return { last24h, previous24h, top };
  }
}
