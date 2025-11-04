import { PlusOutlined, RedoOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { type ResourceTableHeaderI18n } from './config';
import type { ResourceTableEventInterface } from './ResourceTableEventInterface';
import type { HTMLAttributes } from 'react';

export interface ResourceTableHeaderProps
  extends HTMLAttributes<HTMLDivElement> {
  tableEvent: ResourceTableEventInterface;
  actionLeft?: React.ReactNode;
  actionRight?: React.ReactNode;
  settings: { [key in keyof ResourceTableHeaderI18n]: string | false };
}

export function ResourceTableHeader(props: ResourceTableHeaderProps) {
  const { tableEvent, settings, actionLeft, actionRight, ...rest } = props;
  const resource = tableEvent.getResource();

  return (
    <div
      data-testid="ResourcesTableHeader"
      className="flex items-center justify-between"
      {...rest}
    >
      <div data-testid="ResourcesTableHeaderLeftActions"></div>
      <div
        data-testid="ResourcesTableHeaderRightActions"
        className="text-lg flex gap-2 py-2"
      >
        {actionLeft}

        {settings.create && (
          <Button
            title={settings.create}
            data-testid="ResourcesTableCreateButton"
            className="min-w-8 max-w-20"
            icon={<PlusOutlined className="text-sm" />}
            type="primary"
            onClick={tableEvent?.onCreated.bind(tableEvent, { resource })}
          >
            <span className="truncate">{settings.create}</span>
          </Button>
        )}

        {settings.refresh && (
          <span
            data-testid="ResourcesTableRefreshButton"
            title={settings.refresh}
            className="text-text hover:text-text-hover cursor-pointer transition-colors"
            onClick={tableEvent?.onRefresh.bind(tableEvent, { resource })}
          >
            <RedoOutlined />
          </span>
        )}

        {actionRight}
      </div>
    </div>
  );
}
