import { AdminPageShell } from '@/uikit/components-pages/AdminPageShell';
import { AdminGithubSettingsPanel } from '@/uikit/components-pages/AdminGithubSettingsPanel';
import { AdminMailSettingsPanel } from '@/uikit/components-pages/AdminMailSettingsPanel';
import { AdminSiteSettingsPanel } from '@/uikit/components-pages/AdminSiteSettingsPanel';
import { useI18nMapping } from '@/uikit/hook/useI18nMapping';
import { i18nConfig } from '@config/i18n';
import { adminSettings18n } from '@config/i18n-mapping/admin18n';
import type { PagesRouteParamsType } from '@server/render/PagesRouteParams';
import { PagesRouteParams } from '@server/render/PagesRouteParams';
import type { GetStaticPropsContext } from 'next';

interface AdminSettingsProps {
  messages: Record<string, string>;
}

const namespace = ['admin_settings', 'permission'];

/**
 * 管理后台站点设置页（Pages Router / CSR）。
 * Shell 由 `_app` 的 {@link AdminPagesAppShell} 提供。
 */
export default function AdminSettingsPage({}: AdminSettingsProps) {
  const seoMetadata = useI18nMapping(adminSettings18n);

  return (
    <AdminPageShell
      title={seoMetadata.title}
      description={seoMetadata.description}
      seoMetadata={seoMetadata}
    >
      <div className="flex w-full flex-col gap-4 sm:gap-5">
        <AdminSiteSettingsPanel tt={seoMetadata} />
        <AdminMailSettingsPanel tt={seoMetadata} />
        <AdminGithubSettingsPanel tt={seoMetadata} />
      </div>
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
