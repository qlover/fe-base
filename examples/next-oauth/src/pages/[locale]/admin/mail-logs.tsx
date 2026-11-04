import dynamic from 'next/dynamic';
import { AdminMailLogsPanel } from '@/uikit/components-pages/AdminMailLogsPanel';
import { useAdminNavItems } from '@/uikit/hook/useAdminNavItems';
import { useI18nMapping } from '@/uikit/hook/useI18nMapping';
import { i18nConfig } from '@config/i18n';
import { adminMailLogs18n } from '@config/i18n-mapping/admin18n';
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

interface AdminMailLogsProps {
  messages: Record<string, string>;
}

const namespace = ['admin_mail_logs', 'permission'];

/**
 * Admin 邮件日志页（Pages Router / CSR）。
 * 入口鉴权由 middleware 的 LOGINED_PAGES 负责，数据权限为 `admin_mail_logs_read`。
 */
export default function AdminMailLogsPage({}: AdminMailLogsProps) {
  const seoMetadata = useI18nMapping(adminMailLogs18n);
  const navItems = useAdminNavItems();

  return (
    <AdminLayout seoMetadata={seoMetadata} navItems={navItems}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-primary-text">
          {seoMetadata.title}
        </h1>
        <p className="text-secondary-text mt-2">{seoMetadata.description}</p>
      </div>
      <AdminMailLogsPanel tt={seoMetadata} />
    </AdminLayout>
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
