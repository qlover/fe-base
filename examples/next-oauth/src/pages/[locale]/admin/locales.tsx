import { AdminPageShell } from '@/uikit/components-pages/AdminPageShell';
import { AdminLocalesPanel } from '@/uikit/components-pages/AdminLocalesPanel';
import { useI18nMapping } from '@/uikit/hook/useI18nMapping';
import { i18nConfig } from '@config/i18n';
import { adminLocales18n } from '@config/i18n-mapping/admin18n';
import type { PagesRouteParamsType } from '@server/render/PagesRouteParams';
import { PagesRouteParams } from '@server/render/PagesRouteParams';
import type { GetStaticPropsContext } from 'next';

interface AdminLocalesProps {
  messages: Record<string, string>;
}

const namespace = ['admin_locales', 'permission'];

/**
 * 管理后台多语言 CMS 页（Pages Router / CSR）。
 * Shell 由 `_app` 的 {@link AdminPagesAppShell} 提供。
 */
export default function AdminLocalesPage({}: AdminLocalesProps) {
  const seoMetadata = useI18nMapping(adminLocales18n);

  return (
    <AdminPageShell
      title={seoMetadata.title}
      description={seoMetadata.description}
      seoMetadata={seoMetadata}
    >
      <AdminLocalesPanel tt={seoMetadata} />
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
