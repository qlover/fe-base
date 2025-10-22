import { Table } from 'antd';
import type {
  AdminPageInterface,
  AdminPageState
} from '@/base/port/AdminPageInterface';
import { useStore } from '@/uikit/hook/useStore';
import type { ColumnsType, TableProps } from 'antd/es/table';

export interface AdminTableProps extends TableProps<unknown> {
  columns: ColumnsType<unknown>;
  adminPageInterface: AdminPageInterface<AdminPageState>;
}

export function AdminTable(props: AdminTableProps) {
  const { adminPageInterface, ...tableProps } = props;
  const listParams = useStore(adminPageInterface, (state) => state.listParams);
  const listState = useStore(adminPageInterface, (state) => state.listState);

  const dataSource = listState.result?.list as unknown[];

  return (
    <Table
      data-testid="AdminTable"
      rowKey="id"
      dataSource={dataSource}
      loading={listState.loading}
      scroll={{ x: true }}
      {...tableProps}
      pagination={{
        pageSizeOptions: [10, 20, 50],
        current: listParams.page,
        pageSize: listParams.pageSize,
        total: listState.result?.total,
        onChange: (page, pageSize) => {
          adminPageInterface.changeListParams({
            page,
            pageSize
          });
        },
        ...tableProps.pagination
      }}
    />
  );
}
