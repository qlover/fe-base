import { Table } from 'antd';
import { useMemo } from 'react';
import { useStore } from '@/uikit/hook/useStore';
import { AdminTableAction, type AdminTableActionTT } from './AdminTableAction';
import { resourceSelectors } from './config';
import type { AdminTableEventInterface } from './AdminTableEventInterface';
import type { AdminTableOption } from './AdminTableOption';
import type { TableColumnProps } from 'antd';
import type { TableProps } from 'antd/es/table';
import type { ColumnType } from 'antd/lib/table';

export interface AdminTableProps<T> extends TableProps<T> {
  columns: AdminTableOption<T>[];
  tableEvent: AdminTableEventInterface;
  actionProps?: false | (TableColumnProps<T> & AdminTableActionTT);
}

export function AdminTable<T>(props: AdminTableProps<T>) {
  const { tableEvent, columns, actionProps, ...tableProps } = props;
  const resource = tableEvent.getResource();
  const resourceStore = resource.getStore();
  const searchParams = useStore(resourceStore, resourceSelectors.searchParams);
  const listState = useStore(resourceStore, resourceSelectors.listState);
  const dataSource = listState.result?.list as T[];

  const innerColumns = useMemo(() => {
    if (actionProps === false) {
      return columns;
    }

    return [
      ...columns,
      {
        title: 'Action',
        dataIndex: 'action',
        fixed: 'right',
        width: 160,
        render: (_, record: T) => (
          <AdminTableAction
            data-testid="innerColumns"
            tableEvent={tableEvent}
            record={record}
            editText={actionProps!.editText}
            deleteText={actionProps!.deleteText}
            detailText={actionProps!.detailText}
          />
        ),
        ...actionProps
      }
    ] as ColumnType<T>[];
  }, [actionProps, columns, tableEvent]);

  return (
    <Table
      data-testid="ResourcesTable"
      rowKey="id"
      dataSource={dataSource}
      loading={listState.loading}
      scroll={{ x: true }}
      {...tableProps}
      columns={innerColumns}
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
