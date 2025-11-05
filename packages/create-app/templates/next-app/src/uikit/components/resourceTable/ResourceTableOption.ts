import type { ValueOf } from '@qlover/fe-corekit';
import type { FormItemProps } from 'antd';
import type { ColumnType } from 'antd/es/table';
import type { Key } from 'react';

export type RenderForm<T> = (
  option: Omit<ResourceTableOption<T>, 'renderForm'>,
  index: number
) => React.ReactNode;

export const ResourceTableFormMap = {
  input: 'input',
  textarea: 'textarea',
  select: 'select'
} as const;

export type ResourceTableFormType = ValueOf<typeof ResourceTableFormMap>;

export interface ResourceTableTT extends Record<string, string> {
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

export interface ResourceTableOption<T> extends ColumnType<T> {
  key: Key;

  /**
   * Translation interface
   */
  tt: ResourceTableTT;

  /**
   * Render form component
   */
  renderForm?: ResourceTableFormType | RenderForm<T>;
  /**
   * Form item wrap props
   */
  formItemWrapProps?: FormItemProps<T>;
  /**
   * Form item props
   */
  formItemProps?: unknown;
}
