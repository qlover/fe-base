import type { ValueOf } from '@qlover/fe-corekit';
import type { FormItemProps } from 'antd';
import type { ColumnType } from 'antd/es/table';
import type { Key } from 'react';

export type RenderForm<T> = (
  option: Omit<AdminTableOption<T>, 'renderForm'>,
  index: number
) => React.ReactNode;

export const AdminTableFormMap = {
  input: 'input',
  textarea: 'textarea',
  select: 'select'
} as const;

export type AdminTableFormType = ValueOf<typeof AdminTableFormMap>;

export interface AdminTableTT extends Record<string, string> {
  /**
   * Table title
   */
  tableTitle: string;
  /**
   * Table description
   */
  description: string;
  /**
   * Form item label
   */
  formItemLabel: string;
  /**
   * Form item placeholder
   */
  formItemPlaceholder: string;
  /**
   * Form item error
   */
  formItemError: string;

  formItemRequired: string;
}

export interface AdminTableOption<T> extends ColumnType<T> {
  key: Key;

  /**
   * Translation interface
   */
  tt: AdminTableTT;

  /**
   * Render form component
   */
  renderForm?: AdminTableFormType | RenderForm<T>;
  /**
   * Form item wrap props
   */
  formItemWrapProps?: FormItemProps<T>;
  /**
   * Form item props
   */
  formItemProps?: unknown;
}
