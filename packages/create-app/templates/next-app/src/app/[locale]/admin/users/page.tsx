'use client';

import { AdminUserService } from '@/base/services/AdminUserService';
import { AdminTable } from '@/uikit/components/adminTable/AdminTable';
import { useAdminPageInit } from '@/uikit/components/adminTable/useAdminPage';
import { ClientSeo } from '@/uikit/components/ClientSeo';
import { useI18nInterface } from '@/uikit/hook/useI18nInterface';
import { useIOC } from '@/uikit/hook/useIOC';
import { userSchema, type UserSchema } from '@migrations/schema/UserSchema';
import { adminUsers18n } from '@config/i18n';
import type { ColumnsType } from 'antd/es/table';

const baseColumns: ColumnsType<UserSchema> = Object.keys(
  userSchema.omit({
    password: true,
    credential_token: true
  }).shape
).map((key) => ({
  title: key,
  dataIndex: key
}));

export default function UsersPage() {
  const pageService = useIOC(AdminUserService);
  const tt = useI18nInterface(adminUsers18n);

  useAdminPageInit(pageService);

  const columns: ColumnsType<UserSchema> = baseColumns;

  return (
    <div data-testid="UsersPage">
      <ClientSeo i18nInterface={tt} />
      <AdminTable
        columns={columns as ColumnsType<unknown>}
        adminPageInterface={pageService}
      />
    </div>
  );
}
