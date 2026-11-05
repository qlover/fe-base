import { AdminPageShell } from '@/uikit/components-pages/AdminPageShell';
import { AdminUsersPanel } from '@/uikit/components-pages/AdminUsersPanel';
import { useI18nMapping } from '@/uikit/hook/useI18nMapping';
import { i18nConfig } from '@config/i18n';
import { adminUsers18n } from '@config/i18n-mapping/admin18n';
import type { PagesRouteParamsType } from '@server/render/PagesRouteParams';
import { PagesRouteParams } from '@server/render/PagesRouteParams';
import type { GetStaticPropsContext } from 'next';

interface AdminUserPageProps {
  messages: Record<string, string>;
}

const namespace = 'admin_users';

/**
 * Admin users (Pages Router / CSR).
 * Shell chrome comes from `_app` {@link AdminPagesAppShell}.
 */
export default function AdminUserPage({}: AdminUserPageProps) {
  const seoMetadata = useI18nMapping(adminUsers18n);

  return (
    <AdminPageShell
      title={seoMetadata.title}
      description={seoMetadata.description}
      seoMetadata={seoMetadata}
    >
      <AdminUsersPanel tt={seoMetadata} />
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
