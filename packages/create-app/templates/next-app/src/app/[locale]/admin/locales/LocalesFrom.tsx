import { Form } from 'antd';
import type { AdminTableEventInterface } from '@/uikit/components/adminTable/AdminTableEventInterface';

export function LocalesFrom(props: { tableEvent: AdminTableEventInterface }) {
  return <Form data-testid="LocalesFrom"></Form>;
}
