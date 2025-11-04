import { useSliceStore } from '@qlover/slice-store-react';
import { Table } from 'antd';
import { useMemo } from 'react';
import { resourceSelectors } from './config';
import { ResourceTableAction } from './ResourceTableAction';
import type { ResourceTableActionI18n } from './config';
import type { ResourceTableEventInterface } from './ResourceTableEventInterface';
import type { ResourceTableOption } from './ResourceTableOption';
import type { TableColumnProps, TableProps } from 'antd';

export interface ResourceTableProps<T> extends TableProps<T> {
  columns: ResourceTableOption<T>[];
  tableEvent: ResourceTableEventInterface;
  actionProps?: false | (TableColumnProps<T> & ResourceTableActionI18n);
}

export function ResourceTable<T>(props: ResourceTableProps<T>) {
  const { tableEvent, columns, actionProps, ...tableProps } = props;
  const resource = tableEvent.getResource();
  const resourceStore = resource.getStore();
  const searchParams = useSliceStore(
    resourceStore,
    resourceSelectors.searchParams
  );
  const listState = useSliceStore(resourceStore, resourceSelectors.listState);
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
          <ResourceTableAction
            data-testid="innerColumns"
            tableEvent={tableEvent}
            record={record}
            settings={actionProps}
          />
        ),
        ...actionProps
      }
    ] as TableProps<T>['columns'];
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
