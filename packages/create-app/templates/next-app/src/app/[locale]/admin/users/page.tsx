'use client';

import { Table } from 'antd';
import { useEffect, useRef } from 'react';
import { AdminUserService } from '@/base/services/AdminUserService';
import { ClientSeo } from '@/uikit/components/ClientSeo';
import { useI18nInterface } from '@/uikit/hook/useI18nInterface';
import { useIOC } from '@/uikit/hook/useIOC';
import { useStore } from '@/uikit/hook/useStore';
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
  const adminUserService = useIOC(AdminUserService);
  const tt = useI18nInterface(adminUsers18n);
  const listParams = useStore(adminUserService, (state) => state.listParams);
  const listState = useStore(adminUserService, (state) => state.listState);
  const mouted = useRef(false);

  useEffect(() => {
    if (!mouted.current) {
      mouted.current = true;

      requestAnimationFrame(() => {
        adminUserService.initialize();
      });
    }
  }, [adminUserService]);

  const dataSource = listState.result?.list as UserSchema[];

  const columns: ColumnsType<UserSchema> = baseColumns;

  return (
    <div data-testid="UsersPage">
      <ClientSeo i18nInterface={tt} />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={dataSource}
        loading={listState.loading}
        scroll={{ x: true }}
        pagination={{
          pageSizeOptions: [10, 20, 50],
          current: listParams.page,
          pageSize: listParams.pageSize,
          total: listState.result?.total,
          onChange: (page, pageSize) => {
            adminUserService.changeListParams({
              page,
              pageSize
            });
          }
        }}
      />
    </div>
  );
}
