import dynamic from 'next/dynamic';
import { UserAuthFailed } from '@/uikit/components/UserAuthFailed';
import { WithUserAuth } from '@/uikit/components-pages/WithUserAuth';
import { useI18nMapping } from '@/uikit/hook/useI18nMapping';
import { defaultNavItems } from '@config/adminNavs';
import { i18nConfig } from '@config/i18n';
import { admin18n } from '@config/i18n-mapping/admin18n';
import type { PagesRouteParamsType } from '@server/PagesRouteParams';
import { PagesRouteParams } from '@server/PagesRouteParams';
import type { GetStaticPropsContext } from 'next';

const AdminLayout = dynamic(
  () =>
    import('@/uikit/components-pages/AdminLayout').then(
      (mod) => mod.AdminLayout
    ),
  { ssr: false }
);

interface AdminIndexProps {
  messages: Record<string, string>;
}

const namespace = 'admin_home';

export default function AdminIndex({}: AdminIndexProps) {
  const seoMetadata = useI18nMapping(admin18n);

  return (
    <WithUserAuth failedElement={<UserAuthFailed />}>
      <AdminLayout seoMetadata={seoMetadata} navItems={defaultNavItems}>
        <div>{seoMetadata.description}</div>
      </AdminLayout>
    </WithUserAuth>
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
