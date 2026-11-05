import { AdminPageShell } from '@/uikit/components-pages/AdminPageShell';
import { AdminMailLogsPanel } from '@/uikit/components-pages/AdminMailLogsPanel';
import { useI18nMapping } from '@/uikit/hook/useI18nMapping';
import { i18nConfig } from '@config/i18n';
import { adminMailLogs18n } from '@config/i18n-mapping/admin18n';
import type { PagesRouteParamsType } from '@server/render/PagesRouteParams';
import { PagesRouteParams } from '@server/render/PagesRouteParams';
import type { GetStaticPropsContext } from 'next';

interface AdminMailLogsProps {
  messages: Record<string, string>;
}

const namespace = ['admin_mail_logs', 'permission'];

/**
 * 管理后台邮件日志页（Pages Router / CSR）。
 * Shell 由 `_app` 的 {@link AdminPagesAppShell} 提供；数据权限为 `admin_mail_logs_read`。
 */
export default function AdminMailLogsPage({}: AdminMailLogsProps) {
  const seoMetadata = useI18nMapping(adminMailLogs18n);

  return (
    <AdminPageShell
      title={seoMetadata.title}
      description={seoMetadata.description}
      seoMetadata={seoMetadata}
    >
      <AdminMailLogsPanel tt={seoMetadata} />
    </AdminPageShell>
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
