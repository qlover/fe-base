import { AdminPageShell } from '@/uikit/components-pages/AdminPageShell';
import { useI18nMapping } from '@/uikit/hook/useI18nMapping';
import { i18nConfig } from '@config/i18n';
import { admin18n } from '@config/i18n-mapping/admin18n';
import type { PagesRouteParamsType } from '@server/render/PagesRouteParams';
import { PagesRouteParams } from '@server/render/PagesRouteParams';
import type { GetStaticPropsContext } from 'next';

interface AdminIndexProps {
  messages: Record<string, string>;
}

const namespace = 'admin_home';

/**
 * Admin home (Pages Router / CSR).
 * Shell chrome comes from `_app` {@link AdminPagesAppShell}.
 */
export default function AdminIndex({}: AdminIndexProps) {
  const seoMetadata = useI18nMapping(admin18n);

  return (
    <AdminPageShell
      title={seoMetadata.title}
      description={seoMetadata.description}
      seoMetadata={seoMetadata}
    >
      <p className="text-base text-secondary-text">{seoMetadata.description}</p>
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
