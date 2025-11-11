'use client';

import { ResourceTable } from '@brain-toolkit/antd-blocks/resourceTable/ResourceTable';
import { ResourceTableHeader } from '@brain-toolkit/antd-blocks/resourceTable/ResourceTableHeader';
import { useFactory, useLifecycle } from '@brain-toolkit/react-kit';
import { ResourceStore } from '@qlover/corekit-bridge';
import { useMemo } from 'react';
import { ResourceState } from '@/base/cases/ResourceState';
import { ZodColumnBuilder } from '@/base/cases/ZodColumnBuilder';
import { AdminUserApi } from '@/base/services/adminApi/AdminUserApi';
import { AdminPageEvent } from '@/base/services/AdminPageEvent';
import { ResourceService } from '@/base/services/ResourceService';
import { ClientSeo } from '@/uikit/components/ClientSeo';
import { useI18nInterface } from '@/uikit/hook/useI18nInterface';
import { useIOC } from '@/uikit/hook/useIOC';
import { useWarnTranslations } from '@/uikit/hook/useWarnTranslations';
import { userSchema } from '@migrations/schema/UserSchema';
import { adminUsers18n, adminTableI18n } from '@config/i18n';

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

      <ResourceTableHeader
        settings={Object.assign({}, tt, { create: false })}
        tableEvent={pageEvent}
      />

      <ResourceTable
        columns={options}
        tableEvent={pageEvent}
        actionProps={false}
      />
    </div>
  );
}
