'use client';

import { AdminLocalesService } from '@/base/services/AdminLocalesService';
import { AdminPageEvent } from '@/base/services/AdminPageEvent';
import { EditableCell } from '@/uikit/components/adminTable/EditableCell';
import { ClientSeo } from '@/uikit/components/ClientSeo';
import { AdminTable } from '@/uikit/components/adminTable/AdminTable';
import { useI18nInterface } from '@/uikit/hook/useI18nInterface';
import { useIOC } from '@/uikit/hook/useIOC';
import { useLifecycle } from '@/uikit/hook/useLifecycle';
import {
  localesSchema,
  type LocalesSchema
} from '@migrations/schema/LocalesSchema';
import { adminLocales18n } from '@config/i18n';
import type { LocaleType } from '@config/i18n/i18nConfig';
import { i18nConfig } from '@config/i18n/i18nConfig';
import type { ColumnsType } from 'antd/es/table';

export default function LocalesPage() {
  const pageService = useIOC(AdminLocalesService);
  const pageEvent = useIOC(AdminPageEvent);
  const tt = useI18nInterface(adminLocales18n);

  useLifecycle(pageService);

  const columns: ColumnsType<LocalesSchema> = Object.keys(
    localesSchema.shape
  ).map((key) => ({
    title: key,
    dataIndex: key,
    render: (text: string, record: LocalesSchema) => {
      if (i18nConfig.supportedLngs.includes(key as LocaleType)) {
        return (
          <EditableCell
            data-testid={`editable-cell-${key}`}
            value={text}
            onSave={(value) =>
              pageService.update({
                id: record.id,
                [key]: value
              })
            }
          />
        );
      }
      return text;
    }
  }));

  return (
    <div data-testid="LocalesPage">
      <ClientSeo i18nInterface={tt} />
      <AdminTable
        columns={columns as ColumnsType<unknown>}
        resource={pageService}
        tableEvent={pageEvent}
      />
    </div>
  );
}
