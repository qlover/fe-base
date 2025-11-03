import { Form, type FormProps } from 'antd';
import { useCallback } from 'react';
import { useStore } from '@/uikit/hook/useStore';
import type { AdminLocalesI18nInterface } from '@config/i18n';
import {
  AdminTableEventAction,
  type AdminTableEventInterface
} from './AdminTableEventInterface';
import { AdminTableSchemaFormFooter } from './AdminTableSchemaFormFooter';
import { eventSelectos } from './config';
import { SchemaFormMap } from './SchemaFormMap';
import type { AdminTableOption } from './AdminTableOption';
import type { FormInstance } from 'antd/lib';

const { Item: FormItem } = Form;

export interface AdminTableSchemaFormProps<T> extends FormProps {
  formRef: FormInstance<unknown>;
  options: AdminTableOption<T>[];
  children?: React.ReactNode;
  tableEvent: AdminTableEventInterface;
  tt: AdminLocalesI18nInterface;
}

export function AdminTableSchemaForm<T>(props: AdminTableSchemaFormProps<T>) {
  const { options, children, tt, formRef, tableEvent, ...rest } = props;
  const action = useStore(tableEvent.store, eventSelectos.action);

  const disabled = action === AdminTableEventAction.DETAIL;

  const renderItem = useCallback(
    (option: AdminTableOption<T>, index: number) => {
      const { renderForm, formItemWrapProps, formItemProps, ...rest } = option;
      if (!renderForm) return null;

      if (typeof renderForm === 'function') {
        return renderForm(rest, index);
      }

      const Component = SchemaFormMap[renderForm];

      if (!Component) {
        console.warn(`SchemaFormMap[${renderForm}] is not found`);
        return null;
      }

      const unionKey = String(rest.key) + index;
      return (
        <FormItem
          data-testid={'AdminTableForm' + unionKey}
          key={unionKey}
          {...formItemWrapProps}
          label={formItemWrapProps?.label}
        >
          <Component
            disabled={disabled}
            {...(formItemProps as Record<string, unknown>)}
          />
        </FormItem>
      );
    },
    [disabled]
  );

  return (
    <Form
      form={formRef}
      data-testid="AdminTableSchemaForm"
      layout="vertical"
      onFinish={tableEvent.onSubmit.bind(tableEvent)}
      {...rest}
    >
      {options.map(renderItem)}

      {children || (
        <AdminTableSchemaFormFooter tt={tt} tableEvent={tableEvent} />
      )}
    </Form>
  );
}
