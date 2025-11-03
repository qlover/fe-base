'use client';

import { ResourceStore } from '@qlover/corekit-bridge';
import { useMemo } from 'react';
import { ResourceState } from '@/base/cases/ResourceState';
import { ZodColumnBuilder } from '@/base/cases/ZodColumnBuilder';
import { AdminUserApi } from '@/base/services/adminApi/AdminUserApi';
import { AdminPageEvent } from '@/base/services/AdminPageEvent';
import { ResourceService } from '@/base/services/ResourceService';
import { AdminTable } from '@/uikit/components/adminTable/AdminTable';
import { AdminTableHeader } from '@/uikit/components/adminTable/AdminTableHeader';
import { adminTableI18n } from '@/uikit/components/adminTable/config';
import { ClientSeo } from '@/uikit/components/ClientSeo';
import { useFactory } from '@/uikit/hook/useFactory';
import { useI18nInterface } from '@/uikit/hook/useI18nInterface';
import { useIOC } from '@/uikit/hook/useIOC';
import { useLifecycle } from '@/uikit/hook/useLifecycle';
import { useWarnTranslations } from '@/uikit/hook/useWarnTranslations';
import { userSchema } from '@migrations/schema/UserSchema';
import { adminUsers18n } from '@config/i18n';

const ns = 'admin_users';

const localesTT = {
  ...adminUsers18n,
  ...adminTableI18n
};

export default function UsersPage() {
  const tt = useI18nInterface(localesTT);
  const t = useWarnTranslations();
  const adminUserApi = useIOC(AdminUserApi);
  const resourceStore = useFactory(ResourceStore, () => new ResourceState());
  const service = useFactory(ResourceService, ns, resourceStore, adminUserApi);
  const pageEvent = useFactory(AdminPageEvent, ns, service);

  const zodColumnBuilder = useFactory(
    ZodColumnBuilder,
    ns,
    userSchema.omit({
      password: true,
      credential_token: true
    })
  );

  useLifecycle(pageEvent);

  const options = useMemo(
    () => zodColumnBuilder.translate(t).buildAll(),
    [t, zodColumnBuilder]
  );

  return (
    <div data-testid="UsersPage">
      <ClientSeo i18nInterface={tt} />

      <AdminTableHeader
        settings={Object.assign({}, tt, { create: false })}
        tableEvent={pageEvent}
      />

      <AdminTable
        columns={options}
        tableEvent={pageEvent}
        actionProps={false}
      />
    </div>
  );
}
