import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PermissionKey } from '@shared/auth/permissionKeys';
import {
  AdminOverviewCheckKey,
  AdminOverviewCheckState,
  AdminOverviewRange
} from '@schemas/AdminOverviewSchema';
import type { AdminOverviewRepository } from '@server/repositorys/AdminOverviewRepository';
import type { UserFeedbackRepository } from '@server/repositorys/UserFeedbackRepository';
import type { AdminOverviewConfigCheckService } from '@server/services/admin-overview/AdminOverviewConfigCheckService';
import { AdminOverviewRangeResolver } from '@server/services/admin-overview/AdminOverviewRangeResolver';
import { AdminOverviewService } from '@server/services/admin-overview/AdminOverviewService';
import type { CurrentUserPermissionService } from '@server/services/CurrentUserPermissionService';
import type { MemoryKvCacheService } from '@server/services/MemoryKvCacheService';

describe('AdminOverviewService.load', () => {
  let createChecker: ReturnType<typeof vi.fn>;
  let fetchMetrics: ReturnType<typeof vi.fn>;
  let fetchTrend: ReturnType<typeof vi.fn>;
  let countFailures: ReturnType<typeof vi.fn>;
  let fetchFailureGroups: ReturnType<typeof vi.fn>;
  let countOpenFeedback: ReturnType<typeof vi.fn>;
  let listAllForAdmin: ReturnType<typeof vi.fn>;
  let check: ReturnType<typeof vi.fn>;
  let getItem: ReturnType<typeof vi.fn>;
  let setItem: ReturnType<typeof vi.fn>;
  let service: AdminOverviewService;

  beforeEach(() => {
    createChecker = vi.fn();
    fetchMetrics = vi
      .fn()
      .mockResolvedValue({ signups: 2, activeUsers: 5, feedback: 1 });
    fetchTrend = vi.fn().mockResolvedValue([]);
    countFailures = vi.fn().mockResolvedValue(1);
    fetchFailureGroups = vi.fn().mockResolvedValue([]);
    countOpenFeedback = vi.fn().mockResolvedValue(3);
    listAllForAdmin = vi.fn().mockResolvedValue([]);
    check = vi.fn().mockResolvedValue([
      {
        key: AdminOverviewCheckKey.encryptionKey,
        state: AdminOverviewCheckState.ok
      }
    ]);
    getItem = vi.fn().mockResolvedValue(null);
    setItem = vi.fn().mockResolvedValue(undefined);

    service = new AdminOverviewService(
      {
        createChecker
      } as unknown as CurrentUserPermissionService,
      new AdminOverviewRangeResolver(),
      {
        fetchMetrics,
        fetchTrend,
        countFailures,
        fetchFailureGroups
      } as unknown as AdminOverviewRepository,
      {
        countOpenFeedback,
        listAllForAdmin
      } as unknown as UserFeedbackRepository,
      { check } as unknown as AdminOverviewConfigCheckService,
      { getItem, setItem } as unknown as MemoryKvCacheService
    );
  });

  it('nulls modules the current user cannot read', async () => {
    createChecker.mockResolvedValue(
      (key: string) => key === PermissionKey.admin_request_logs_read
    );

    const overview = await service.load(AdminOverviewRange.week);

    expect(overview.metrics).toBeNull();
    expect(overview.trend).toBeNull();
    expect(overview.checks).toBeNull();
    expect(overview.feedbackTodo).toBeNull();
    expect(overview.latestFeedback).toBeNull();
    expect(overview.failures).toEqual({
      last24h: 1,
      previous24h: 1,
      top: []
    });
    expect(fetchMetrics).not.toHaveBeenCalled();
    expect(check).not.toHaveBeenCalled();
  });

  it('loads metrics, feedback and checks when permitted', async () => {
    createChecker.mockResolvedValue(() => true);

    const overview = await service.load(AdminOverviewRange.today);

    expect(overview.metrics).toEqual({
      current: { signups: 2, activeUsers: 5, feedback: 1 },
      previous: { signups: 2, activeUsers: 5, feedback: 1 }
    });
    expect(overview.feedbackTodo).toEqual({ openTotal: 3, openStale: 3 });
    expect(overview.latestFeedback).toEqual([]);
    expect(overview.checks).toHaveLength(1);
    expect(setItem).toHaveBeenCalled();
  });
});

describe('AdminOverviewRangeResolver', () => {
  it('uses hour buckets for today and day buckets for week', () => {
    const resolver = new AdminOverviewRangeResolver();
    const now = new Date('2026-11-05T10:00:00+08:00');

    const today = resolver.resolve(AdminOverviewRange.today, now);
    const week = resolver.resolve(AdminOverviewRange.week, now);

    expect(today.trend.granularity).toBe('hour');
    expect(week.trend.granularity).toBe('day');
  });
});
