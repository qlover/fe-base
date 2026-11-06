import { useI18nMapping } from '@/uikit/hook/useI18nMapping';
import { SettingsAppearancePanel } from '@/uikit/components-app/settings/SettingsAppearancePanel';
import { SettingsPageShell } from '@/uikit/components-app/settings/SettingsPageShell';
import { i18nConfig } from '@config/i18n';
import { settingsI18n } from '@config/i18n-mapping/settingsI18n';
import type { PagesRouteParamsType } from '@server/render/PagesRouteParams';
import { PagesRouteParams } from '@server/render/PagesRouteParams';
import type { GetStaticPropsContext } from 'next';

interface SettingsAppearancePageProps {
  messages: Record<string, string>;
}

const pageNamespaces = ['page_settings', 'page_home', 'common'] as const;

/**
 * 设置 · 外观。
 */
export default function SettingsAppearancePage({}: SettingsAppearancePageProps) {
  const tt = useI18nMapping(settingsI18n);

  return (
    <SettingsPageShell tt={tt}>
      <SettingsAppearancePanel tt={tt} />
    </SettingsPageShell>
  );
}

export async function getStaticProps({
  params
}: GetStaticPropsContext<PagesRouteParamsType>) {
  const pageParams = new PagesRouteParams(params);
  const messages = await pageParams.getI18nMessages([...pageNamespaces]);

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
