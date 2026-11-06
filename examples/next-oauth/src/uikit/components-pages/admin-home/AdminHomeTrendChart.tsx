'use client';

import { clsx } from 'clsx';
import type { AdminHomeI18nInterface } from '@config/i18n-mapping/admin18n';
import {
  AdminOverviewTrendGranularity,
  type AdminOverviewTrendType
} from '@schemas/AdminOverviewSchema';
import { ADMIN_HOME_CARD_CLS } from './AdminHomeStyleConfig';
import type { ReactNode } from 'react';

const ACTIVE_BAR_CLS = 'bg-brand';
const SIGNUP_BAR_CLS = 'bg-primary-text/25';

/**
 * 「活跃趋势」柱状图：每个桶并排两根柱（活跃用户 / 新注册）。
 */
export function AdminHomeTrendChart({
  tt,
  trend,
  className
}: {
  readonly tt: AdminHomeI18nInterface;
  readonly trend: AdminOverviewTrendType;
  readonly className?: string;
}): ReactNode {
  const max = Math.max(
    1,
    ...trend.points.map((point) => Math.max(point.activeUsers, point.signups))
  );
  const labelOf = (bucket: string): string =>
    trend.granularity === AdminOverviewTrendGranularity.hour
      ? bucket.slice(11, 16)
      : bucket.slice(5, 10);
  const first = trend.points[0];
  const last = trend.points[trend.points.length - 1];

  return (
    <div
      data-testid="AdminHomeTrendChart"
      className={clsx(ADMIN_HOME_CARD_CLS, 'p-4', className)}
    >
      <div className="flex items-center">
        <h2 className="text-sm font-semibold">{tt.trendTitle}</h2>
        <div className="text-secondary-text ml-auto flex gap-3 text-[11px]">
          <span className="flex items-center gap-1">
            <i
              className={clsx('inline-block size-2 rounded-sm', ACTIVE_BAR_CLS)}
            />
            {tt.kpiActiveUsers}
          </span>
          <span className="flex items-center gap-1">
            <i
              className={clsx('inline-block size-2 rounded-sm', SIGNUP_BAR_CLS)}
            />
            {tt.kpiSignups}
          </span>
        </div>
      </div>
      <div className="mt-4 flex h-40 items-end gap-1">
        {trend.points.map((point) => (
          <div
            data-testid="AdminHomeTrendBar"
            key={point.bucket}
            title={`${labelOf(point.bucket)} · ${tt.kpiActiveUsers} ${String(point.activeUsers)} · ${tt.kpiSignups} ${String(point.signups)}`}
            className="flex h-full flex-1 items-end gap-px"
          >
            <div
              className={clsx('flex-1 rounded-t-[3px]', ACTIVE_BAR_CLS)}
              style={{ height: `${(point.activeUsers / max) * 100}%` }}
            />
            <div
              className={clsx('flex-1 rounded-t-[3px]', SIGNUP_BAR_CLS)}
              style={{ height: `${(point.signups / max) * 100}%` }}
            />
          </div>
        ))}
      </div>
      {first && last ? (
        <div className="text-tertiary-text mt-1 flex justify-between text-[10px] tabular-nums">
          <span>{labelOf(first.bucket)}</span>
          <span>{labelOf(last.bucket)}</span>
        </div>
      ) : null}
    </div>
  );
}
