'use client';

import { clsx } from 'clsx';
import type { AdminOverviewRangeType } from '@schemas/AdminOverviewSchema';
import type { ReactNode } from 'react';

export type AdminHomeRangeOptionType = {
  readonly value: AdminOverviewRangeType;
  readonly label: string;
};

/**
 * 概览统计范围分段切换（今天 / 近 7 天 / 近 30 天）。
 */
export function AdminHomeRangeSwitch({
  value,
  options,
  disabled,
  onChange
}: {
  readonly value: AdminOverviewRangeType;
  readonly options: ReadonlyArray<AdminHomeRangeOptionType>;
  readonly disabled: boolean;
  readonly onChange: (value: AdminOverviewRangeType) => void;
}): ReactNode {
  return (
    <div
      data-testid="AdminHomeRangeSwitch"
      role="group"
      className="border-primary-border flex overflow-hidden rounded-lg border text-xs"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            data-testid="AdminHomeRangeSwitchOption"
            key={option.value}
            type="button"
            aria-pressed={active}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={clsx(
              'px-3 py-1.5 transition disabled:cursor-wait',
              active
                ? 'bg-brand text-on-brand'
                : 'text-secondary-text hover:text-primary-text'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
