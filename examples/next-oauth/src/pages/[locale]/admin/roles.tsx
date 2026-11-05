import { AdminPageShell } from '@/uikit/components-pages/AdminPageShell';
import { AdminRolesPanel } from '@/uikit/components-pages/AdminRolesPanel';
import { useI18nMapping } from '@/uikit/hook/useI18nMapping';
import { i18nConfig } from '@config/i18n';
import { adminRoles18n } from '@config/i18n-mapping/admin18n';
import type { PagesRouteParamsType } from '@server/render/PagesRouteParams';
import { PagesRouteParams } from '@server/render/PagesRouteParams';
import type { GetStaticPropsContext } from 'next';

interface AdminRolesProps {
  messages: Record<string, string>;
}

const namespace = ['admin_roles', 'permission'];

/**
 * 管理后台角色页（Pages Router / CSR）。
 * Shell 由 `_app` 的 {@link AdminPagesAppShell} 提供。
 */
export default function AdminRolesPage({}: AdminRolesProps) {
  const seoMetadata = useI18nMapping(adminRoles18n);

  return (
    <AdminPageShell
      title={seoMetadata.title}
      description={seoMetadata.description}
      seoMetadata={seoMetadata}
    >
      <AdminRolesPanel tt={seoMetadata} />
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
