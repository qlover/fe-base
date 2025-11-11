import { Button } from 'antd';
import type { ResourceTableActionI18n } from './config';
import type { ResourceTableEventInterface } from './ResourceTableEventInterface';
import type { HTMLAttributes } from 'react';

export interface ResourceTableActionProps<T>
  extends HTMLAttributes<HTMLDivElement> {
  record: T;
  tableEvent: ResourceTableEventInterface;
  settings?: ResourceTableActionI18n;
}

export function ResourceTableAction<T>(props: ResourceTableActionProps<T>) {
  const { settings, record, tableEvent, ...rest } = props;

  const editText = settings?.editText || 'Edit';
  const deleteText = settings?.deleteText || 'Delete';
  const detailText = settings?.detailText || 'Detail';

  return (
    <div
      data-testid="ResourceTableAction"
      className="flex gap-2 flex-wrap w-40"
      {...rest}
    >
      <Button
        type="link"
        onClick={tableEvent.onEdited.bind(tableEvent, { dataSource: record })}
      >
        {editText}
      </Button>

      <Button
        type="link"
        onClick={tableEvent.onDetail.bind(tableEvent, { dataSource: record })}
      >
        {detailText}
      </Button>
      <Button
        type="link"
        danger
        onClick={tableEvent.onDeleted.bind(tableEvent, { dataSource: record })}
      >
        {deleteText}
      </Button>
    </div>
  );
}
