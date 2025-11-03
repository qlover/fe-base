import { Button } from 'antd';
import css from './table.module.css';
import type { AdminTableEventInterface } from './AdminTableEventInterface';
export interface AdminTableActionTT {
  editText: string;
  deleteText: string;
  detailText: string;
}

export interface AdminTableActionProps<T> extends AdminTableActionTT {
  record: T;
  tableEvent: AdminTableEventInterface;
}

export function AdminTableAction<T>(props: AdminTableActionProps<T>) {
  const { editText, deleteText, detailText, record, tableEvent } = props;
  return (
    <div data-testid="AdminTableAction" className="flex gap-2 flex-wrap w-40">
      <Button
        type="link"
        className={css.actionButton}
        onClick={tableEvent.onEdited.bind(tableEvent, { dataSource: record })}
      >
        {editText}
      </Button>

      <Button
        type="link"
        className={css.actionButton}
        onClick={tableEvent.onDetail.bind(tableEvent, { dataSource: record })}
      >
        {detailText}
      </Button>
      <Button
        type="link"
        danger
        className={css.actionButton}
        onClick={tableEvent.onDeleted.bind(tableEvent, { dataSource: record })}
      >
        {deleteText}
      </Button>
    </div>
  );
}
