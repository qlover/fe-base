import { useMemo } from 'react';
import { ClientSeo } from '@/uikit/components/ClientSeo';
import { AppRoutePagePages } from '@/uikit/components-app/AppRoutePagePages';
import { DeveloperAppsPageComponent } from '@/uikit/components-app/developer/apps/DeveloperAppsPage';
import { useI18nMapping } from '@/uikit/hook/useI18nMapping';
import { i18nConfig } from '@config/i18n';
import { COMMON_ADMIN_TITLE } from '@config/i18n-identifier/common/common';
import { developerAppsI18n } from '@config/i18n-mapping/developerAppsI18n';
import type { PagesRouteParamsType } from '@server/render/PagesRouteParams';
import { PagesRouteParams } from '@server/render/PagesRouteParams';
import type { OAuthClientListItem } from '@qlover/oauth-wrapper';
import type { GetStaticPropsContext } from 'next';

interface DeveloperAppsProps {
  messages: Record<string, string>;
  initialApps: OAuthClientListItem[];
}

const pageNamespaces = ['developer_apps', 'page_home'] as const;

/**
 * Developer apps console (Pages Router / CSR).
 * Entry auth is middleware via LOGINED_PAGES; page renders shell immediately.
 */
export default function DeveloperApps({ initialApps }: DeveloperAppsProps) {
  const i18nInterface = useMemo(() => {
    return {
      ...developerAppsI18n,
      adminTitle: COMMON_ADMIN_TITLE
    };
  }, []);
  const seoMetadata = useI18nMapping(i18nInterface);

  return (
    <AppRoutePagePages
      tt={{
        title: seoMetadata.consoleSubtitle,
        adminTitle: seoMetadata.adminTitle
      }}
      headerTitleClassName="text-brand"
      showAdminButton={false}
      showAuthButton
      authButtonShowLogoutLabel
      mainProps={{ className: 'flex flex-1 flex-col bg-primary' }}
    >
      <ClientSeo i18nInterface={seoMetadata} />
      <DeveloperAppsPageComponent initialApps={initialApps} />
    </AppRoutePagePages>
  );
}

export async function getStaticProps({
  params
}: GetStaticPropsContext<PagesRouteParamsType>) {
  const pageParams = new PagesRouteParams(params);
  const messages = await pageParams.getI18nMessages([...pageNamespaces]);

  // Fetch initial apps list (server-side)
  // For now, we'll fetch on client side in the component
  const initialApps: OAuthClientListItem[] = [];

  return {
    props: {
      messages,
      initialApps
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
