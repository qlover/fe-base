'use client';

import {
  ResourceTable,
  ResourceTableHeader,
  ResourceTablePopup,
  ResourceTableSchemaForm
} from '@brain-toolkit/antd-blocks/resourceTable';
import { useFactory, useLifecycle } from '@brain-toolkit/react-kit';
import { Form, Input } from 'antd';
import { useCallback, useMemo } from 'react';
import { ZodColumnBuilder } from '@/base/cases/ZodColumnBuilder';
import type { AdminLocalesApi } from '@/base/services/adminApi/AdminLocalesApi';
import { AdminLocalesService } from '@/base/services/AdminLocalesService';
import { AdminPageEvent } from '@/base/services/AdminPageEvent';
import { ClientSeo } from '@/uikit/components/ClientSeo';
import { EditableCell } from '@/uikit/components/EditableCell';
import { LocalesImportButton } from '@/uikit/components/localesImportButton/LocalesImportButton';
import { LocalesImportEvent } from '@/uikit/components/localesImportButton/LocalesImportEvent';
import { useI18nInterface } from '@/uikit/hook/useI18nInterface';
import { useIOC } from '@/uikit/hook/useIOC';
import { useWarnTranslations } from '@/uikit/hook/useWarnTranslations';
import {
  localesSchema,
  type LocalesSchema
} from '@migrations/schema/LocalesSchema';
import { adminLocales18n, adminTableI18n, i18nConfig } from '@config/i18n';
import { I } from '@config/IOCIdentifier';

const localesTT = {
  ...adminLocales18n,
  ...adminTableI18n
};

export default function LocalesPage() {
  const tt = useI18nInterface(localesTT);
  const t = useWarnTranslations();
  const [schemaFormRef] = Form.useForm();

  const pageService = useIOC(AdminLocalesService);
  const uiDialog = useIOC(I.DialogHandler);
  const ns = pageService.serviceName;

  const zodColumnBuilder = useFactory(ZodColumnBuilder, ns, localesSchema);
  const pageEvent = useFactory(
    AdminPageEvent,
    ns,
    pageService,
    schemaFormRef,
    uiDialog
  );
  const localesImportEvent = useFactory(
    LocalesImportEvent,
    pageService.resourceApi as AdminLocalesApi
  );

  const importTT = {
    zh: {
      title: tt.importZhTitle
    },
    en: {
      title: tt.importEnTitle
    }
  };

  useLifecycle(pageEvent);

  const renderCell = useCallback(
    (key: string) => {
      const renderEditableCell = (
        value: unknown,
        record: LocalesSchema,
        _index: number
      ) => {
        return (
          <EditableCell
            data-testid={`editable-cell-${key}`}
            value={value as string}
            onSave={(value) =>
              pageService.update({
                id: record.id,
                [key]: value
              })
            }
          />
        );
      };

      renderEditableCell.displayName = `EditableCellWrapper-${key}`;

      return renderEditableCell;
    },
    [pageService]
  );

  const options = useMemo(() => {
    i18nConfig.supportedLngs.forEach((locale) => {
      zodColumnBuilder.render(locale, renderCell(locale));
    });

    return zodColumnBuilder.translate(t).buildAll();
  }, [t, zodColumnBuilder, renderCell]);

  return (
    <div data-testid="LocalesPage">
      <ClientSeo i18nInterface={tt} />

      <ResourceTableHeader
        settings={tt}
        tableEvent={pageEvent}
        actionLeft={
          <>
            <LocalesImportButton
              event={localesImportEvent}
              title={tt.importTitle}
              tt={importTT}
            />
          </>
        }
      />

      <ResourceTable
        columns={options}
        tableEvent={pageEvent}
        actionProps={{
          title: tt.action,
          editText: tt.editText,
          deleteText: tt.deleteText,
          detailText: tt.detailText
        }}
      />

      <ResourceTablePopup
        tableEvent={pageEvent}
        tt={{
          create: tt.createTitle,
          edit: tt.editTitle,
          detail: tt.detailTitle
        }}
      >
        <ResourceTableSchemaForm
          formComponents={{
            input: Input
          }}
          formRef={schemaFormRef}
          options={options}
          tt={tt}
          tableEvent={pageEvent}
        />
      </ResourceTablePopup>
    </div>
  );
}
