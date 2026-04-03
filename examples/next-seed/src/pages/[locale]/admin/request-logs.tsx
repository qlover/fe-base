import dynamic from 'next/dynamic';
import { useLocale } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { UserAuthFailed } from '@/uikit/components/UserAuthFailed';
import { RequestLogsTable } from '@/uikit/components-pages/RequestLogsTable';
import { WithUserAuth } from '@/uikit/components-pages/WithUserAuth';
import { PageI18nProvider } from '@/uikit/context/PageI18nContext';
import { useI18nMapping } from '@/uikit/hook/useI18nMapping';
import { defaultNavItems } from '@config/adminNavs';
import { API_USER_REQUEST_LOGS } from '@config/apiRoutes';
import { i18nConfig } from '@config/i18n';
import { adminRequestLogs18n } from '@config/i18n-mapping/admin18n';
import type { RequestLogRow } from '@schemas/RequestLogSchema';
import type { PagesRouteParamsType } from '@server/render/PagesRouteParams';
import { PagesRouteParams } from '@server/render/PagesRouteParams';
import type { GetStaticPropsContext } from 'next';

const AdminLayout = dynamic(
  () =>
    import('@/uikit/components-pages/AdminLayout').then(
      (mod) => mod.AdminLayout
    ),
  { ssr: false }
);

interface AdminRequestLogsProps {
  messages: Record<string, string>;
}

const namespace = 'admin_request_logs';

export default function AdminRequestLogsPage({}: AdminRequestLogsProps) {
  const locale = useLocale();
  const pageI18n = useMemo(() => adminRequestLogs18n, []);
  const seoMetadata = useI18nMapping(pageI18n);
  const [rows, setRows] = useState<RequestLogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(API_USER_REQUEST_LOGS, {
          credentials: 'same-origin'
        });
        const json: unknown = await res.json();
        if (
          !cancelled &&
          typeof json === 'object' &&
          json !== null &&
          'success' in json &&
          json.success === true &&
          'data' in json &&
          Array.isArray((json as { data: unknown }).data)
        ) {
          setRows((json as { data: RequestLogRow[] }).data);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageI18nProvider value={seoMetadata}>
      <WithUserAuth failedElement={<UserAuthFailed />}>
        <AdminLayout seoMetadata={seoMetadata} navItems={defaultNavItems}>
          <div>
            <h1 className="text-2xl font-semibold text-primary-text mb-6">
              {seoMetadata.title}
            </h1>
            <p className="text-secondary-text mb-6">
              {seoMetadata.description}
            </p>
            <RequestLogsTable rows={rows} locale={locale} loading={loading} />
          </div>
        </AdminLayout>
      </WithUserAuth>
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
