'use client';

import { clsx } from 'clsx';
import { ADMIN_HOME_CARD_CLS } from './AdminHomeStyleConfig';
import type { ReactNode } from 'react';

const BLOCK_CLS = 'bg-primary-border/50 rounded';

const KPI_SLOTS = [0, 1] as const;
const TODO_SLOTS = [0] as const;
const TREND_BARS = Array.from({ length: 14 }, (_, index) => index);
const LIST_ROWS = [0, 1, 2, 3, 4] as const;

const BAR_HEIGHTS = [38, 52, 45, 60, 48, 70, 55, 62, 50, 74, 58, 66, 80, 64];

/**
 * 概览首屏骨架：与完整布局同结构，避免数据到达时页面突然撑高。
 */
export function AdminHomeSkeleton(): ReactNode {
  return (
    <div data-testid="AdminHomeSkeleton" aria-busy className="animate-pulse">
      <section className="mt-6">
        <div className={clsx(BLOCK_CLS, 'h-3 w-16')} />
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {TODO_SLOTS.map((slot) => (
            <div
              data-testid="AdminHomeSkeletonTodo"
              key={slot}
              className={clsx(ADMIN_HOME_CARD_CLS, 'p-4')}
            >
              <div className={clsx(BLOCK_CLS, 'h-3 w-20')} />
              <div className={clsx(BLOCK_CLS, 'mt-2 h-7 w-12')} />
              <div className={clsx(BLOCK_CLS, 'mt-2 h-2.5 w-32')} />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <div className={clsx(BLOCK_CLS, 'h-3 w-28')} />
        <div className="mt-2 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {KPI_SLOTS.map((slot) => (
            <div
              data-testid="AdminHomeSkeletonKpi"
              key={slot}
              className={clsx(ADMIN_HOME_CARD_CLS, 'p-3.5')}
            >
              <div className={clsx(BLOCK_CLS, 'h-2.5 w-14')} />
              <div className={clsx(BLOCK_CLS, 'mt-2 h-5 w-16')} />
              <div className={clsx(BLOCK_CLS, 'mt-1.5 h-2.5 w-10')} />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className={clsx(ADMIN_HOME_CARD_CLS, 'p-4 lg:col-span-2')}>
          <div className={clsx(BLOCK_CLS, 'h-3.5 w-20')} />
          <div className="mt-4 flex h-40 items-end gap-1">
            {TREND_BARS.map((index) => (
              <div
                data-testid="AdminHomeSkeletonBar"
                key={index}
                className={clsx(BLOCK_CLS, 'flex-1 rounded-b-none')}
                style={{ height: `${String(BAR_HEIGHTS[index] ?? 50)}%` }}
              />
            ))}
          </div>
        </div>
        <div className={clsx(ADMIN_HOME_CARD_CLS, 'p-4')}>
          <div className={clsx(BLOCK_CLS, 'h-3.5 w-20')} />
          <div className="mt-4 space-y-3.5">
            {LIST_ROWS.map((row) => (
              <div
                data-testid="AdminHomeSkeletonCheck"
                key={row}
                className="flex items-center gap-2"
              >
                <div className="bg-primary-border/50 size-2 rounded-full" />
                <div className={clsx(BLOCK_CLS, 'h-3 flex-1')} />
                <div className={clsx(BLOCK_CLS, 'h-3 w-10')} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
