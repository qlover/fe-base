'use client';

import { clsx } from 'clsx';
import type { AdminHomeI18nInterface } from '@config/i18n-mapping/admin18n';
import {
  AdminOverviewRange,
  type AdminOverviewMetricsType,
  type AdminOverviewRangeType
} from '@schemas/AdminOverviewSchema';
import {
  ADMIN_HOME_CARD_CLS,
  ADMIN_HOME_SECTION_TITLE_CLS
} from './AdminHomeStyleConfig';
import type { ReactNode } from 'react';

type KpiItemType = {
  readonly key: keyof AdminOverviewMetricsType;
  readonly label: string;
};

const DELTA_TONE_CLS = {
  up: 'text-emerald-600',
  down: 'text-red-500',
  flat: 'text-tertiary-text'
} as const;

/**
 * 「核心指标」：当前区间计数 + 与上一周期对比。
 */
export function AdminHomeKpiGrid({
  tt,
  locale,
  range,
  current,
  previous
}: {
  readonly tt: AdminHomeI18nInterface;
  readonly locale: string;
  readonly range: AdminOverviewRangeType;
  readonly current: AdminOverviewMetricsType;
  readonly previous: AdminOverviewMetricsType;
}): ReactNode {
  const items: ReadonlyArray<KpiItemType & { readonly neutral?: boolean }> = [
    { key: 'signups', label: tt.kpiSignups },
    { key: 'activeUsers', label: tt.kpiActiveUsers },
    { key: 'feedback', label: tt.kpiFeedback, neutral: true }
  ];
  const absolute = range === AdminOverviewRange.today;

  return (
    <section data-testid="AdminHomeKpiGrid" className="mt-6">
      <h2 className={ADMIN_HOME_SECTION_TITLE_CLS}>
        {tt.sectionKpi}
        <span className="text-tertiary-text font-normal">
          {' · '}
          {absolute ? tt.kpiCompareToday : tt.kpiCompare}
        </span>
      </h2>
      <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-3">
        {items.map((item) => {
          const value = current[item.key];
          const diff = value - previous[item.key];
          const tone =
            item.neutral || diff === 0 ? 'flat' : diff > 0 ? 'up' : 'down';
          return (
            <div
              data-testid="AdminHomeKpiCard"
              key={item.key}
              className={clsx(ADMIN_HOME_CARD_CLS, 'p-3.5')}
            >
              <div className="text-secondary-text text-[11px]">
                {item.label}
              </div>
              <div className="mt-1 text-lg font-semibold tabular-nums">
                {value.toLocaleString(locale)}
              </div>
              <div
                className={clsx(
                  'mt-0.5 text-[11px] tabular-nums',
                  DELTA_TONE_CLS[tone]
                )}
              >
                {formatDelta(diff, previous[item.key], absolute)}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function formatDelta(
  diff: number,
  previous: number,
  absolute: boolean
): string {
  if (absolute) {
    return `${diff > 0 ? '+' : ''}${String(diff)}`;
  }
  if (previous === 0) {
    return diff === 0 ? '0%' : '—';
  }
  const pct = Math.round((diff / previous) * 100);
  return `${pct > 0 ? '+' : ''}${String(pct)}%`;
}
