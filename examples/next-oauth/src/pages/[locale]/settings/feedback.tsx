import { SettingsFeedbackPanel } from '@/uikit/components-app/settings/SettingsFeedbackPanel';
import { SettingsPageShell } from '@/uikit/components-app/settings/SettingsPageShell';
import { useI18nMapping } from '@/uikit/hook/useI18nMapping';
import { i18nConfig } from '@config/i18n';
import { accountI18n } from '@config/i18n-mapping/accountI18n';
import { settingsI18n } from '@config/i18n-mapping/settingsI18n';
import type { PagesRouteParamsType } from '@server/render/PagesRouteParams';
import { PagesRouteParams } from '@server/render/PagesRouteParams';
import type { GetStaticPropsContext } from 'next';

interface SettingsFeedbackPageProps {
  messages: Record<string, string>;
}

const pageNamespaces = [
  'page_settings',
  'page_account',
  'page_home',
  'common'
] as const;

/**
 * 设置 · 反馈。
 */
export default function SettingsFeedbackPage({}: SettingsFeedbackPageProps) {
  const hubTt = useI18nMapping(settingsI18n);
  const accountTt = useI18nMapping(accountI18n);

  return (
    <SettingsPageShell tt={hubTt}>
      <SettingsFeedbackPanel tt={accountTt} />
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
