import { Button, Form } from 'antd';
import { useCallback, useMemo } from 'react';
import { useStore } from '@/uikit/hook/useStore';
import type { AdminLocalesI18nInterface } from '@config/i18n';
import {
  AdminTableEventAction,
  type AdminTableEventInterface
} from './AdminTableEventInterface';
import { eventSelectos } from './config';

export function AdminTableSchemaFormFooter(props: {
  tt: AdminLocalesI18nInterface;
  tableEvent: AdminTableEventInterface;
}) {
  const { tt, tableEvent } = props;

  const action = useStore(tableEvent.store, eventSelectos.action);
  const createLoading = useStore(tableEvent.store, eventSelectos.createLoading);
  const editLoading = useStore(tableEvent.store, eventSelectos.editLoading);

  const okButtonText = useMemo(() => {
    switch (action) {
      case AdminTableEventAction.CREATE:
        return tt.createButton;
      case AdminTableEventAction.EDIT:
        return tt.saveButton;
      case AdminTableEventAction.DETAIL:
        return tt.editTitle;
      default:
        return tt.saveButton;
    }
  }, [action, tt]);

  const onOk = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      switch (action) {
        // use form submit to handle edit and create
        // case AdminTableEventAction.EDIT:
        // case AdminTableEventAction.CREATE:
        //   break;
        // use onEdited to handle detail
        case AdminTableEventAction.DETAIL:
          tableEvent.onEdited({
            dataSource: tableEvent.store.state.selectedResource
          });
          e.stopPropagation();
          e.preventDefault();
          break;
        default:
          break;
      }
    },
    [action, tableEvent]
  );

  const loading = createLoading || editLoading;
  const htmlType = useMemo(() => {
    return action === AdminTableEventAction.CREATE ||
      action === AdminTableEventAction.EDIT
      ? 'submit'
      : 'button';
  }, [action]);

  return (
    <div data-testid="AdminTableSchemaFormFooter">
      <Form.Item>
        <Button
          block
          type="primary"
          loading={loading}
          htmlType={htmlType}
          onClick={onOk}
        >
          {okButtonText}
        </Button>
      </Form.Item>

      <Form.Item>
        <Button
          block
          disabled={loading}
          type="default"
          htmlType="reset"
          onClick={tableEvent.onClosePopup.bind(tableEvent)}
        >
          {tt.cancelButton}
        </Button>
      </Form.Item>
    </div>
  );
}
