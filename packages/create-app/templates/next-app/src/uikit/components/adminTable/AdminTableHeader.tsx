import { PlusOutlined, RedoOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { type AdminTableHeaderI18n } from './config';
import { With } from '../With';
import type { AdminTableEventInterface } from './AdminTableEventInterface';

export function AdminTableHeader(props: {
  tableEvent: AdminTableEventInterface;
  actionLeft?: React.ReactNode;
  actionRight?: React.ReactNode;
  settings: { [key in keyof AdminTableHeaderI18n]: string | false };
}) {
  const { tableEvent, settings: tt, actionLeft, actionRight } = props;
  const resource = tableEvent.getResource();

  return (
    <div
      data-testid="ResourcesTableHeader"
      className="flex items-center justify-between"
    >
      <div data-testid="ResourcesTableHeaderLeftActions"></div>
      <div
        data-testid="ResourcesTableHeaderRightActions"
        className="text-lg flex gap-2 py-2"
      >
        {actionLeft}

        <With it={tt.create as string}>
          {(create) => (
            <Button
              title={create}
              data-testid="ResourcesTableCreateButton"
              className="min-w-8 max-w-20"
              icon={<PlusOutlined className="text-sm" />}
              type="primary"
              onClick={tableEvent?.onCreated.bind(tableEvent, { resource })}
            >
              <span className="truncate">{tt.create}</span>
            </Button>
          )}
        </With>

        <With it={tt.refresh as string}>
          {(refresh) => (
            <span
              data-testid="ResourcesTableRefreshButton"
              title={refresh}
              className="text-text hover:text-text-hover cursor-pointer transition-colors"
              onClick={tableEvent?.onRefresh.bind(tableEvent, { resource })}
            >
              <RedoOutlined />
            </span>
          )}
        </With>

        {actionRight}
      </div>
    </div>
  );
}
