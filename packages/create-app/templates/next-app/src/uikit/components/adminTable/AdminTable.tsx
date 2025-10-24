import {
  type ResourceServiceInterface,
  type ResourceStore
} from '@qlover/corekit-bridge';
import { Table } from 'antd';
import type { ResourceState } from '@/base/cases/ResourceState';
import { useStore } from '@/uikit/hook/useStore';
import type { AdminTableEventInterface } from './AdminTableEventInterface';
import type { ColumnsType, TableProps } from 'antd/es/table';

export interface AdminTableProps extends TableProps<unknown> {
  columns: ColumnsType<unknown>;
  resource: ResourceServiceInterface<unknown, ResourceStore<ResourceState>>;
  tableEvent?: AdminTableEventInterface;
}

const selectors = {
  searchParams: (state: ResourceState) => state.searchParams,
  listState: (state: ResourceState) => state.listState
};

export function AdminTable(props: AdminTableProps) {
  const { resource, tableEvent, ...tableProps } = props;
  const store = resource.getStore();
  const searchParams = useStore(store, selectors.searchParams);
  const listState = useStore(store, selectors.listState);
  const dataSource = listState.result?.list as unknown[];

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
