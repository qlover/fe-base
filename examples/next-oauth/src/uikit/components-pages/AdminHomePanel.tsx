'use client';

import { clsx } from 'clsx';
import { useLocale } from 'next-intl';
import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { AdminOverviewApi } from '@/impls/appApi/AdminOverviewApi';
import { useAdminNavItems } from '@/uikit/hook/useAdminNavItems';
import { useIOC } from '@/uikit/hook/useIOC';
import type { AdminHomeI18nInterface } from '@config/i18n-mapping/admin18n';
import {
  AdminOverviewRange,
  type AdminOverviewRangeType,
  type AdminOverviewType
} from '@schemas/AdminOverviewSchema';
import { AdminHomeChecksCard } from './admin-home/AdminHomeChecksCard';
import { AdminHomeFailuresCard } from './admin-home/AdminHomeFailuresCard';
import { AdminHomeFeedbackCard } from './admin-home/AdminHomeFeedbackCard';
import { AdminHomeKpiGrid } from './admin-home/AdminHomeKpiGrid';
import { AdminHomeRangeSwitch } from './admin-home/AdminHomeRangeSwitch';
import { AdminHomeShortcuts } from './admin-home/AdminHomeShortcuts';
import { AdminHomeSkeleton } from './admin-home/AdminHomeSkeleton';
import { ADMIN_HOME_GRID_CLS } from './admin-home/AdminHomeStyleConfig';
import { AdminHomeTodoCards } from './admin-home/AdminHomeTodoCards';
import { AdminHomeTrendChart } from './admin-home/AdminHomeTrendChart';

export type AdminHomePanelProps = {
  readonly tt: AdminHomeI18nInterface;
};

/**
 * Admin 概览编排：范围切换、加载 / 重试；各模块按服务端返回（无权限为 null）决定是否渲染。
 */
export function AdminHomePanel({ tt }: AdminHomePanelProps): ReactElement {
  const locale = useLocale();
  const overviewApi = useIOC(AdminOverviewApi);
  const navItems = useAdminNavItems();
  const [range, setRange] = useState<AdminOverviewRangeType>(
    AdminOverviewRange.week
  );
  const [reloadToken, setReloadToken] = useState<number>(0);
  const [data, setData] = useState<AdminOverviewType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadFailed, setLoadFailed] = useState<boolean>(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadFailed(false);
    overviewApi
      .load(range, controller.signal)
      .then((overview) => setData(overview))
      .catch(() => {
        if (!controller.signal.aborted) {
          setLoadFailed(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [overviewApi, range, reloadToken]);

  const reload = useCallback((): void => {
    setReloadToken((token) => token + 1);
  }, []);

  const rangeOptions = [
    { value: AdminOverviewRange.today, label: tt.rangeToday },
    { value: AdminOverviewRange.week, label: tt.rangeWeek },
    { value: AdminOverviewRange.month, label: tt.rangeMonth }
  ] as const;
  const nowMs = data ? Date.parse(data.generatedAt) : 0;
  const nothingVisible =
    data !== null &&
    data.metrics === null &&
    data.feedbackTodo === null &&
    data.latestFeedback === null &&
    data.failures === null &&
    data.checks === null;

  return (
    <div data-testid="AdminHomePanel" className="mx-auto max-w-6xl pb-10">
      <div className="flex flex-wrap items-center gap-3">
        {data ? (
          <p className="text-tertiary-text text-xs tabular-nums">
            {tt.generatedAt}{' '}
            {new Date(data.generatedAt).toLocaleTimeString(locale, {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        ) : null}
        <div className="ml-auto">
          <AdminHomeRangeSwitch
            value={range}
            options={rangeOptions}
            disabled={loading}
            onChange={setRange}
          />
        </div>
      </div>

      {loadFailed ? (
        <div
          role="alert"
          className="mt-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-3 text-sm text-red-500"
        >
          {tt.loadFailed}
          <button
            type="button"
            onClick={reload}
            className="ml-auto text-xs font-semibold underline"
          >
            {tt.retry}
          </button>
        </div>
      ) : null}

      {data === null && loading ? <AdminHomeSkeleton /> : null}

      {data ? (
        <div className={clsx('transition-opacity', loading && 'opacity-60')}>
          <AdminHomeTodoCards
            tt={tt}
            locale={locale}
            feedbackTodo={data.feedbackTodo}
            failures={data.failures}
          />

          {data.metrics ? (
            <AdminHomeKpiGrid
              tt={tt}
              locale={locale}
              range={data.range}
              current={data.metrics.current}
              previous={data.metrics.previous}
            />
          ) : null}

          {data.trend || data.checks ? (
            <section className={clsx('mt-6', ADMIN_HOME_GRID_CLS)}>
              {data.trend ? (
                <AdminHomeTrendChart
                  tt={tt}
                  trend={data.trend}
                  className={clsx(
                    data.checks ? 'lg:col-span-2' : 'lg:col-span-3'
                  )}
                />
              ) : null}
              {data.checks ? (
                <AdminHomeChecksCard
                  tt={tt}
                  locale={locale}
                  checks={data.checks}
                />
              ) : null}
            </section>
          ) : null}

          {data.latestFeedback || data.failures ? (
            <section className={clsx('mt-4', ADMIN_HOME_GRID_CLS)}>
              {data.latestFeedback ? (
                <AdminHomeFeedbackCard
                  tt={tt}
                  locale={locale}
                  items={data.latestFeedback}
                  className={clsx(
                    data.failures ? 'lg:col-span-2' : 'lg:col-span-3'
                  )}
                />
              ) : null}
              {data.failures ? (
                <AdminHomeFailuresCard
                  tt={tt}
                  locale={locale}
                  failures={data.failures}
                  nowMs={nowMs}
                />
              ) : null}
            </section>
          ) : null}

          {nothingVisible ? (
            <p className="text-tertiary-text mt-6 text-sm">{tt.emptyAll}</p>
          ) : null}
        </div>
      ) : null}

      <AdminHomeShortcuts tt={tt} locale={locale} navItems={navItems} />
    </div>
  );
}
