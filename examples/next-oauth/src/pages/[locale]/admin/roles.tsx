import dynamic from 'next/dynamic';
import { AdminRolesPanel } from '@/uikit/components-pages/AdminRolesPanel';
import { useAdminNavItems } from '@/uikit/hook/useAdminNavItems';
import { useI18nMapping } from '@/uikit/hook/useI18nMapping';
import { i18nConfig } from '@config/i18n';
import { adminRoles18n } from '@config/i18n-mapping/admin18n';
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

interface AdminRolesProps {
  messages: Record<string, string>;
}

const namespace = ['admin_roles', 'permission'];

/**
 * Admin platform roles (Pages Router / CSR).
 * Entry auth is middleware via LOGINED_PAGES.
 */
export default function AdminRolesPage({}: AdminRolesProps) {
  const seoMetadata = useI18nMapping(adminRoles18n);
  const navItems = useAdminNavItems();

  return (
    <AdminLayout seoMetadata={seoMetadata} navItems={navItems}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-primary-text">
          {seoMetadata.title}
        </h1>
        <p className="text-secondary-text mt-2">{seoMetadata.description}</p>
      </div>
      <AdminRolesPanel tt={seoMetadata} />
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
