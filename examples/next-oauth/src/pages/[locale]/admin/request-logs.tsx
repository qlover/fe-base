import { useStore } from '@brain-toolkit/react-kit';
import { TrashIcon } from '@heroicons/react/24/outline';
import {
  ResourceSearch,
  type ResourceSearchParams
} from '@qlover/corekit-bridge';
import { Button } from '@qlover/next-kit/client';
import { PageI18nProvider } from '@qlover/next-kit/client';
import { useStrictEffect } from '@qlover/next-kit/client';
import { useLocale } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { RequestLogsApi } from '@/impls/appApi/RequestLogsApi';
import { AdminPageShell } from '@/uikit/components-pages/AdminPageShell';
import { RequestLogsTable } from '@/uikit/components-pages/RequestLogsTable';
import { PermissionKey, useCan } from '@/uikit/hook/useHasPermission';
import { useI18nMapping } from '@/uikit/hook/useI18nMapping';
import { useIOC } from '@/uikit/hook/useIOC';
import { defaultSearchParams } from '@config/common';
import { i18nConfig } from '@config/i18n';
import { adminRequestLogs18n } from '@config/i18n-mapping/admin18n';
import { I } from '@config/ioc-identifiter';
import type { PagesRouteParamsType } from '@server/render/PagesRouteParams';
import { PagesRouteParams } from '@server/render/PagesRouteParams';
import type { GetStaticPropsContext } from 'next';

interface AdminRequestLogsProps {
  messages: Record<string, string>;
}

const namespace = 'admin_request_logs';

const requestLogsSearchDefaultCriteria: ResourceSearchParams = {
  page: defaultSearchParams.page,
  pageSize: defaultSearchParams.pageSize,
  sort: [...defaultSearchParams.sort]
};

/**
 * 管理后台请求日志页（Pages Router / CSR）。
 * Shell 由 `_app` 的 {@link AdminPagesAppShell} 提供。
 */
export default function AdminRequestLogsPage({}: AdminRequestLogsProps) {
  const locale = useLocale();
  const pageI18n = useMemo(() => adminRequestLogs18n, []);
  const requestLogsApi = useIOC(RequestLogsApi);
  const dialogHandler = useIOC(I.DialogHandler);
  const seoMetadata = useI18nMapping(pageI18n);
  const { allowed: canClear } = useCan(PermissionKey.admin_request_logs_write);
  const [clearing, setClearing] = useState(false);

  const searchResource = useMemo(
    () =>
      new ResourceSearch(requestLogsApi, {
        serviceName: 'requestLogsSearch',
        store: {
          criteria: requestLogsSearchDefaultCriteria
        }
      }),
    [requestLogsApi]
  );

  const store = searchResource.getStoreInterface();
  const rows = useStore(store, (state) => state.result?.items ?? []);
  const loading = useStore(store, (state) => state.loading);
  const result = useStore(store, (state) => state.result);
  const criteria = useStore(store, (state) => state.criteria);

  const currentPage = criteria?.page ?? defaultSearchParams.page;
  const pageSize = criteria?.pageSize ?? defaultSearchParams.pageSize;
  const total = result?.total ?? 0;

  const handlePaginationChange = useCallback(
    (page: number, nextPageSize: number) => {
      searchResource.refresh({ page, pageSize: nextPageSize });
    },
    [searchResource]
  );

  const tablePagination = useMemo(
    () => ({
      current: currentPage,
      pageSize,
      total,
      showSizeChanger: true,
      pageSizeOptions: ['10', '15', '20', '50', '100'],
      onChange: handlePaginationChange
    }),
    [currentPage, pageSize, total, handlePaginationChange]
  );

  const handleClearLogs = useCallback(() => {
    dialogHandler.confirm({
      title: seoMetadata.clearConfirmTitle,
      content: seoMetadata.clearConfirmContent,
      okText: seoMetadata.clear,
      cancelText: seoMetadata.cancelButton,
      okType: 'danger',
      onOk: async () => {
        setClearing(true);
        try {
          await requestLogsApi.clear();
          dialogHandler.success(seoMetadata.clearSuccess);
          searchResource.refresh({ page: 1 });
        } catch (error) {
          dialogHandler.error(
            error instanceof Error ? error.message : seoMetadata.clear,
            { error }
          );
          throw error;
        } finally {
          setClearing(false);
        }
      }
    });
  }, [dialogHandler, requestLogsApi, searchResource, seoMetadata]);

  useStrictEffect(() => {
    searchResource.refresh();
  }, [searchResource]);

  return (
    <PageI18nProvider value={seoMetadata}>
      <AdminPageShell
        title={seoMetadata.title}
        description={seoMetadata.description}
        seoMetadata={seoMetadata}
      >
        {canClear ? (
          <div className="mb-4 flex justify-end">
            <Button
              variant="danger"
              disabled={clearing || loading || total === 0}
              onClick={handleClearLogs}
            >
              <TrashIcon className="h-4 w-4" />
              {seoMetadata.clear}
            </Button>
          </div>
        ) : null}
        <RequestLogsTable
          rows={rows}
          locale={locale}
          loading={loading || clearing}
          pagination={tablePagination}
        />
      </AdminPageShell>
    </PageI18nProvider>
  );
}

export async function getStaticProps({
  params
}: GetStaticPropsContext<PagesRouteParamsType>) {
  const pageParams = new PagesRouteParams(params);
  const messages = await pageParams.getI18nMessages(namespace);

  return {
    props: {
      messages
    }
  };
}

export async function getStaticPaths() {
  return {
    paths: i18nConfig.supportedLngs.map((locale) => ({
      params: { locale }
    })),
    fallback: false
  };
}
