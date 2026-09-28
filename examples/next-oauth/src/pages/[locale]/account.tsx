import { ClientSeo } from '@qlover/next-kit/client';
import { useMemo } from 'react';
import { AccountPanel } from '@/uikit/components-app/account/AccountPanel';
import { AppRoutePagePages } from '@/uikit/components-app/AppRoutePagePages';
import { useI18nMapping } from '@/uikit/hook/useI18nMapping';
import { i18nConfig } from '@config/i18n';
import { COMMON_ADMIN_TITLE } from '@config/i18n-identifier/common/common';
import { accountI18n } from '@config/i18n-mapping/accountI18n';
import type { PagesRouteParamsType } from '@server/render/PagesRouteParams';
import { PagesRouteParams } from '@server/render/PagesRouteParams';
import type { GetStaticPropsContext } from 'next';

interface AccountPageProps {
  messages: Record<string, string>;
}

const pageNamespaces = ['page_account', 'page_home'] as const;

/**
 * Account center (Pages Router / CSR): profile + change password.
 * Entry auth is middleware via LOGINED_PAGES.
 */
export default function AccountPage({}: AccountPageProps) {
  const i18nInterface = useMemo(() => {
    return {
      ...accountI18n,
      adminTitle: COMMON_ADMIN_TITLE
    };
  }, []);
  const seoMetadata = useI18nMapping(i18nInterface);

  return (
    <AppRoutePagePages
      tt={{
        title: seoMetadata.title,
        adminTitle: seoMetadata.adminTitle
      }}
      headerTitleClassName="text-brand"
      showAdminButton={false}
      showAuthButton
      authButtonShowLogoutLabel
      mainProps={{ className: 'flex flex-1 flex-col bg-primary' }}
    >
      <ClientSeo i18nInterface={seoMetadata} />
      <div
        data-testid="AccountPage"
        className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
      >
        <h1 className="mb-2 text-2xl font-semibold text-primary-text">
          {seoMetadata.title}
        </h1>
        <p className="mb-8 text-sm text-secondary-text">
          {seoMetadata.description}
        </p>
        <AccountPanel tt={seoMetadata} />
      </div>
    </AppRoutePagePages>
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
