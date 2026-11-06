import { AdminHomePanel } from '@/uikit/components-pages/AdminHomePanel';
import { AdminPageShell } from '@/uikit/components-pages/AdminPageShell';
import { useI18nMapping } from '@/uikit/hook/useI18nMapping';
import { i18nConfig } from '@config/i18n';
import { adminHome18n } from '@config/i18n-mapping/admin18n';
import type { PagesRouteParamsType } from '@server/render/PagesRouteParams';
import { PagesRouteParams } from '@server/render/PagesRouteParams';
import type { GetStaticPropsContext } from 'next';

interface AdminIndexProps {
  messages: Record<string, string>;
}

const namespace = 'admin_home';

/**
 * Admin 概览首页。Shell 由 `_app` 的 {@link AdminPagesAppShell} 提供。
 */
export default function AdminIndex({}: AdminIndexProps) {
  const tt = useI18nMapping(adminHome18n);

  return (
    <AdminPageShell title={tt.heading} description={tt.sub} seoMetadata={tt}>
      <AdminHomePanel tt={tt} />
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
