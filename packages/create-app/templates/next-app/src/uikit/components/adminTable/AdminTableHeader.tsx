import { PlusOutlined, RedoOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import type { ResourceState } from '@/base/cases/ResourceState';
import type { AdminTableEventInterface } from './AdminTableEventInterface';
import type { AdminTableHeaderI18n } from './config';
import type {
  ResourceServiceInterface,
  ResourceStore
} from '@qlover/corekit-bridge';

export function AdminTableHeader(props: {
  resource: ResourceServiceInterface<unknown, ResourceStore<ResourceState>>;
  tableEvent?: AdminTableEventInterface;
  tt: AdminTableHeaderI18n;
}) {
  const { resource, tableEvent, tt } = props;

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
        <Button
          title={tt.create}
          data-testid="ResourcesTableCreateButton"
          className="min-w-8 max-w-20"
          icon={<PlusOutlined className="text-sm" />}
          type="primary"
          onClick={tableEvent?.onCreated.bind(tableEvent, { resource })}
        >
          <span className="truncate">{tt.create}</span>
        </Button>

        <span
          title={tt.refresh}
          className="text-text hover:text-text-hover cursor-pointer transition-colors"
          onClick={tableEvent?.onRefresh.bind(tableEvent, { resource })}
        >
          <RedoOutlined />
        </span>
      </div>
    </div>
  );
}
