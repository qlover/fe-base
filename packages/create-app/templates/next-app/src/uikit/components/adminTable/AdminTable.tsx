import {
  type ResourceServiceInterface,
  type ResourceStore
} from '@qlover/corekit-bridge';
import { Table } from 'antd';
import type { ResourceState } from '@/base/cases/ResourceState';
import { useStore } from '@/uikit/hook/useStore';
import type { AdminTableEventInterface } from './AdminTableEventInterface';
import type { AdminTableOption } from './AdminTableOption';
import type { TableProps } from 'antd/es/table';

export interface AdminTableProps<T> extends TableProps<T> {
  columns: AdminTableOption<T>[];
  resource: ResourceServiceInterface<unknown, ResourceStore<ResourceState>>;
  tableEvent?: AdminTableEventInterface;
}

const selectors = {
  searchParams: (state: ResourceState) => state.searchParams,
  listState: (state: ResourceState) => state.listState
};

export function AdminTable<T>(props: AdminTableProps<T>) {
  const { resource, tableEvent, ...tableProps } = props;
  const store = resource.getStore();
  const searchParams = useStore(store, selectors.searchParams);
  const listState = useStore(store, selectors.listState);
  const dataSource = listState.result?.list as T[];

  return (
    <Table
      data-testid="ResourcesTable"
      rowKey="id"
      dataSource={dataSource}
      loading={listState.loading}
      scroll={{ x: true }}
      {...tableProps}
      pagination={{
        pageSizeOptions: [10, 20, 50],
        current: searchParams.page,
        pageSize: searchParams.pageSize,
        total: listState.result?.total,
        onChange: (page, pageSize) => {
          tableEvent?.onChangeParams({ resource, page, pageSize });
        },
        ...tableProps.pagination
      }}
    />
  );
}
