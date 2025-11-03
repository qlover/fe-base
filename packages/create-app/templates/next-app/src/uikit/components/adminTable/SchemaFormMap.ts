import { Input, Select } from 'antd';

const { TextArea } = Input;

export const SchemaFormMap = {
  input: Input,
  textarea: TextArea,
  select: Select
} as const;
