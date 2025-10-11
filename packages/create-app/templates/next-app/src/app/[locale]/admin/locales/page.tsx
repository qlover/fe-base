'use client';

import { AdminLocalesService } from '@/base/services/AdminLocalesService';
import { AdminTable } from '@/uikit/components/adminTable/AdminTable';
import { useAdminTableInit } from '@/uikit/components/adminTable/useAdminTableInit';
import { ClientSeo } from '@/uikit/components/ClientSeo';
import { useI18nInterface } from '@/uikit/hook/useI18nInterface';
import { useIOC } from '@/uikit/hook/useIOC';
import {
  localesSchema,
  type LocalesSchema
} from '@migrations/schema/LocalesSchema';
import { adminLocales18n } from '@config/i18n';
import type { ColumnsType } from 'antd/es/table';

const baseColumns: ColumnsType<LocalesSchema> = Object.keys(
  localesSchema.shape
).map((key) => ({
  title: key,
  dataIndex: key
}));

export default function UsersPage() {
  const adminUserService = useIOC(AdminLocalesService);
  const tt = useI18nInterface(adminLocales18n);

  useAdminTableInit(adminUserService);

  const columns: ColumnsType<LocalesSchema> = baseColumns;

  return (
    <div data-testid="UsersPage">
      <ClientSeo i18nInterface={tt} />
      <AdminTable
        columns={columns as ColumnsType<unknown>}
        adminPageInterface={adminUserService}
      />
    </div>
  );
}
