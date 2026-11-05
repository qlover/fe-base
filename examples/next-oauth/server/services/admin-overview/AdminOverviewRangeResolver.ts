import { injectable } from '@shared/container';
import {
  AdminOverviewRange,
  AdminOverviewTrendGranularity,
  type AdminOverviewRangeType,
  type AdminOverviewTrendGranularityType
} from '@schemas/AdminOverviewSchema';

const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

/** 站点统计时区（北京时间，无夏令时） */
export const ADMIN_OVERVIEW_TIME_ZONE = 'Asia/Shanghai';
const TIME_ZONE_OFFSET_MS = 8 * HOUR_MS;

/** 7 天视图的趋势多看一周，便于对比 */
const TREND_DAYS: Readonly<Record<AdminOverviewRangeType, number>> = {
  [AdminOverviewRange.today]: 1,
  [AdminOverviewRange.week]: 14,
  [AdminOverviewRange.month]: 30
};

export type AdminOverviewWindowType = {
  readonly from: Date;
  readonly to: Date;
};

export type AdminOverviewRangeWindowsType = {
  readonly current: AdminOverviewWindowType;
  readonly previous: AdminOverviewWindowType;
  readonly trend: AdminOverviewWindowType & {
    readonly granularity: AdminOverviewTrendGranularityType;
  };
};

/**
 * 把概览时间范围换算成具体的统计 / 对比 / 趋势区间。
 */
@injectable()
export class AdminOverviewRangeResolver {
  /**
   * @param range - 1 = 今天（北京时间 0 点至今），7 / 30 = 滚动窗口
   * @param now - 当前时刻
   */
  public resolve(
    range: AdminOverviewRangeType,
    now: Date
  ): AdminOverviewRangeWindowsType {
    const nowMs = now.getTime();
    const todayStartMs = this.startOfLocalDay(nowMs);

    if (range === AdminOverviewRange.today) {
      return {
        current: this.window(todayStartMs, nowMs),
        previous: this.window(todayStartMs - DAY_MS, nowMs - DAY_MS),
        trend: {
          ...this.window(todayStartMs, nowMs),
          granularity: AdminOverviewTrendGranularity.hour
        }
      };
    }

    const spanMs = range * DAY_MS;
    return {
      current: this.window(nowMs - spanMs, nowMs),
      previous: this.window(nowMs - 2 * spanMs, nowMs - spanMs),
      trend: {
        ...this.window(todayStartMs - (TREND_DAYS[range] - 1) * DAY_MS, nowMs),
        granularity: AdminOverviewTrendGranularity.day
      }
    };
  }

  protected startOfLocalDay(ms: number): number {
    return (
      Math.floor((ms + TIME_ZONE_OFFSET_MS) / DAY_MS) * DAY_MS -
      TIME_ZONE_OFFSET_MS
    );
  }

  protected window(fromMs: number, toMs: number): AdminOverviewWindowType {
    return { from: new Date(fromMs), to: new Date(toMs) };
  }
}
