'use client';

import { clsx } from 'clsx';
import { type Key, type ReactNode } from 'react';
import { Button } from '@/uikit/components/Button';
import { Loading } from '@/uikit/components/Loading';
import { useI18nMapping } from '@/uikit/hook/useI18nMapping';
import { adminTableI18n } from '@config/i18n-mapping/admin18n';

export type TableColumn<T> = {
  title: ReactNode;
  key?: string;
  dataIndex?: keyof T & string;
  width?: number | string;
  ellipsis?: boolean;
  className?: string;
  render?: (value: unknown, record: T, index: number) => ReactNode;
};

export type TablePaginationConfig = {
  current?: number;
  pageSize?: number;
  total?: number;
  showSizeChanger?: boolean;
  pageSizeOptions?: Array<string | number>;
  onChange?: (page: number, pageSize: number) => void;
};

export type TablePaginationLabels = {
  prev?: string;
  next?: string;
  pageSize?: string;
};

export type TableProps<T> = {
  columns: TableColumn<T>[];
  dataSource: readonly T[];
  rowKey: (keyof T & string) | ((record: T, index: number) => Key);
  loading?: boolean;
  emptyText?: ReactNode;
  pagination?: TablePaginationConfig | false;
  /** Override default i18n pagination labels. */
  paginationLabels?: TablePaginationLabels;
  className?: string;
  /** Min width for horizontal scroll (e.g. `64rem`). */
  minWidthClass?: string;
  'data-testid'?: string;
};

function resolveRowKey<T>(
  rowKey: TableProps<T>['rowKey'],
  record: T,
  index: number
): Key {
  if (typeof rowKey === 'function') return rowKey(record, index);
  const value = record[rowKey];
  if (
    value == null ||
    (typeof value !== 'string' && typeof value !== 'number')
  ) {
    return index;
  }
  return value;
}

function cellValue<T>(record: T, dataIndex?: keyof T & string): unknown {
  if (!dataIndex) return undefined;
  return record[dataIndex];
}

/**
 * Lightweight data table — enough for list pages (columns, empty, loading,
 * server pagination, horizontal scroll). Not an antd Table replacement of all features.
 */
export function Table<T extends object>({
  columns,
  dataSource,
  rowKey,
  loading = false,
  emptyText = 'No data',
  pagination,
  paginationLabels,
  className,
  minWidthClass = 'min-w-[64rem]',
  'data-testid': testId = 'Table'
}: TableProps<T>) {
  const tableTt = useI18nMapping({
    prev: adminTableI18n.prev,
    next: adminTableI18n.next,
    pageSize: adminTableI18n.pageSize
  });
  const prevLabel = paginationLabels?.prev ?? tableTt.prev;
  const nextLabel = paginationLabels?.next ?? tableTt.next;
  const pageSizeLabel = paginationLabels?.pageSize ?? tableTt.pageSize;

  const showPagination = pagination !== false;
  const current =
    pagination && pagination.current != null ? pagination.current : 1;
  const pageSize =
    pagination && pagination.pageSize != null ? pagination.pageSize : 15;
  const total = pagination && pagination.total != null ? pagination.total : 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize) || 1);
  const pageSizeOptions = (pagination && pagination.pageSizeOptions) ?? [
    10, 15, 20, 50, 100
  ];

  const goTo = (page: number, nextSize = pageSize) => {
    if (!pagination || !pagination.onChange) return;
    const max = Math.max(1, Math.ceil(total / nextSize) || 1);
    pagination.onChange(Math.min(Math.max(1, page), max), nextSize);
  };

  return (
    <div data-testid={testId} className={clsx('relative', className)}>
      <div className="border-primary-border overflow-x-auto rounded-xl border">
        <table
          className={clsx(
            'w-full border-collapse text-left text-sm text-primary-text',
            minWidthClass
          )}
        >
          <thead className="bg-elevated text-secondary-text">
            <tr className="border-primary-border border-b">
              {columns.map((col) => (
                <th
                  data-testid="Table"
                  key={col.key ?? col.dataIndex ?? String(col.title)}
                  style={col.width != null ? { width: col.width } : undefined}
                  className={clsx(
                    'px-3 py-3 text-xs font-medium tracking-wide whitespace-nowrap sm:px-4',
                    col.className
                  )}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-primary-border divide-y">
            {!loading && dataSource.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-secondary-text px-4 py-10 text-center"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              dataSource.map((record, index) => (
                <tr
                  data-testid="Table"
                  key={resolveRowKey(rowKey, record, index)}
                  className="hover:bg-elevated/50 transition-colors"
                >
                  {columns.map((col) => {
                    const value = cellValue(record, col.dataIndex);
                    const content = col.render
                      ? col.render(value, record, index)
                      : value == null || value === ''
                        ? '—'
                        : (value as ReactNode);

                    return (
                      <td
                        data-testid="Table"
                        key={col.key ?? col.dataIndex ?? String(col.title)}
                        style={
                          col.width != null ? { width: col.width } : undefined
                        }
                        className={clsx(
                          'px-3 py-3 align-middle sm:px-4',
                          col.ellipsis && 'max-w-48 truncate sm:max-w-[16rem]',
                          col.className
                        )}
                        title={
                          col.ellipsis && typeof content === 'string'
                            ? content
                            : undefined
                        }
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {loading && (
        <div className="bg-primary/60 absolute inset-0 flex items-center justify-center rounded-xl">
          <Loading />
        </div>
      )}

      {showPagination && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-secondary-text">
          <div>
            {total > 0
              ? `${(current - 1) * pageSize + 1}–${Math.min(current * pageSize, total)} / ${total}`
              : `0 / ${total}`}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {pagination?.showSizeChanger && (
              <label className="flex items-center gap-2">
                <span className="sr-only">{pageSizeLabel}</span>
                <select
                  className="border-primary-border bg-primary text-primary-text rounded-lg border px-2 py-1.5"
                  value={pageSize}
                  aria-label={pageSizeLabel}
                  onChange={(e) => goTo(1, Number(e.target.value))}
                >
                  {Array.isArray(pageSizeOptions) &&
                    pageSizeOptions.map((opt) => {
                      const n = Number(opt);
                      return (
                        <option data-testid="Table" key={n} value={n}>
                          {n}
                        </option>
                      );
                    })}
                </select>
              </label>
            )}
            <Button
              variant="secondary"
              size="sm"
              disabled={current <= 1 || loading}
              onClick={() => goTo(current - 1)}
            >
              {prevLabel}
            </Button>
            <span className="min-w-18 text-center text-primary-text">
              {current} / {pageCount}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={current >= pageCount || loading || total === 0}
              onClick={() => goTo(current + 1)}
            >
              {nextLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
