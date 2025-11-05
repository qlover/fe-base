import { useSliceStore } from '@qlover/slice-store-react';
import { Button, Form } from 'antd';
import { useCallback, useMemo } from 'react';
import { eventSelectos } from './config';
import {
  ResourceTableEventAction,
  type ResourceTableEventInterface
} from './ResourceTableEventInterface';
import type { ResourceTableLocales } from './config';

export function ResourceTableSchemaFormFooter(props: {
  tt: ResourceTableLocales;
  tableEvent: ResourceTableEventInterface;
}) {
  const { tt, tableEvent } = props;

  const action = useSliceStore(tableEvent.store, eventSelectos.action);
  const createLoading = useSliceStore(
    tableEvent.store,
    eventSelectos.createLoading
  );
  const editLoading = useSliceStore(
    tableEvent.store,
    eventSelectos.editLoading
  );

  const okButtonText = useMemo(() => {
    switch (action) {
      case ResourceTableEventAction.CREATE:
        return tt.createButton;
      case ResourceTableEventAction.EDIT:
        return tt.saveButton;
      case ResourceTableEventAction.DETAIL:
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
        case ResourceTableEventAction.DETAIL:
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
    return action === ResourceTableEventAction.CREATE ||
      action === ResourceTableEventAction.EDIT
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
