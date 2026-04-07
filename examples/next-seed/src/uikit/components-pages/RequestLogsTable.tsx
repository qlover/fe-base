'use client';

import { Table } from 'antd';
import type { AdminRequestLogsI18nInterface } from '@config/i18n-mapping/admin18n';
import type { RequestLogRow } from '@schemas/RequestLogSchema';
import { usePageI18nMapping } from '../context/PageI18nContext';
import type { ColumnsType } from 'antd/es/table';

export type RequestLogsTableTt = {
  colTime: string;
  colRequestId: string;
  colCategory: string;
  colType: string;
  colSuccess: string;
  colHttp: string;
  colStatus: string;
  colDuration: string;
  colIp: string;
  colLoginMethod: string;
  colError: string;
  empty: string;
};

function payloadObj(row: RequestLogRow): Record<string, unknown> {
  const p = row.payload;
  if (p != null && typeof p === 'object' && !Array.isArray(p)) {
    return p as Record<string, unknown>;
  }
  return {};
}

function str(v: unknown): string | null {
  return typeof v === 'string' ? v : v == null ? null : String(v);
}

function num(v: unknown): number | null {
  return typeof v === 'number' && !Number.isNaN(v) ? v : null;
}

function formatHttp(row: RequestLogRow): string {
  const p = payloadObj(row);
  const method = str(p.http_method) ?? '';
  const path = str(p.http_path) ?? '';
  if (!method && !path) return '—';
  return [method, path].filter(Boolean).join(' ');
}

function formatError(row: RequestLogRow): string {
  const p = payloadObj(row);
  const code = str(p.error_code);
  const message = str(p.error_message);
  if (!code && !message) return '—';
  return [code, message].filter(Boolean).join(' · ');
}

export function RequestLogsTable(props: {
  rows: RequestLogRow[];
  locale: string;
  loading?: boolean;
}) {
  const tt = usePageI18nMapping<AdminRequestLogsI18nInterface>();
  const { rows, locale, loading } = props;
  const localeTag = locale === 'zh' ? 'zh-CN' : 'en-US';

  const columns: ColumnsType<RequestLogRow> = [
    {
      title: tt.colTime,
      dataIndex: 'created_at',
      key: 'created_at',
      width: 188,
      render: (iso: string) =>
        new Date(iso).toLocaleString(localeTag, {
          dateStyle: 'medium',
          timeStyle: 'short'
        })
    },
    {
      title: tt.colRequestId,
      dataIndex: 'request_id',
      key: 'request_id',
      width: 200,
      ellipsis: true,
      render: (v: string | null) =>
        v != null && v !== '' ? (
          <span className="font-mono text-xs">{v}</span>
        ) : (
          '—'
        )
    },
    {
      title: tt.colCategory,
      dataIndex: 'event_category',
      key: 'event_category',
      width: 88
    },
    {
      title: tt.colType,
      dataIndex: 'event_type',
      key: 'event_type',
      width: 120
    },
    {
      title: tt.colSuccess,
      dataIndex: 'success',
      key: 'success',
      width: 72,
      render: (v: boolean) => (v ? '✓' : '✗')
    },
    {
      title: tt.colHttp,
      key: 'http',
      ellipsis: true,
      render: (_, row) => formatHttp(row)
    },
    {
      title: tt.colStatus,
      key: 'http_status',
      width: 72,
      render: (_, row) => {
        const v = num(payloadObj(row).http_status);
        return v == null ? '—' : String(v);
      }
    },
    {
      title: tt.colDuration,
      key: 'duration_ms',
      width: 104,
      render: (_, row) => {
        const v = num(payloadObj(row).duration_ms);
        return v == null ? '—' : String(v);
      }
    },
    {
      title: tt.colIp,
      key: 'ip_address',
      width: 120,
      render: (_, row) => str(payloadObj(row).ip_address) ?? '—'
    },
    {
      title: tt.colLoginMethod,
      key: 'login_method',
      width: 110,
      render: (_, row) => str(payloadObj(row).login_method) ?? '—'
    },
    {
      title: tt.colError,
      key: 'error',
      ellipsis: true,
      render: (_, row) => formatError(row)
    }
  ];

  return (
    <Table<RequestLogRow>
      rowKey="id"
      columns={columns}
      dataSource={rows}
      loading={loading}
      pagination={{ pageSize: 15, showSizeChanger: true }}
      locale={{ emptyText: tt.empty }}
      scroll={{ x: true }}
    />
  );
}
