import { useMemo } from 'react';
import { ClientSeo } from '@/uikit/components/ClientSeo';
import { DemoUiShowcase } from '@/uikit/components-pages/DemoUiShowcase';
import { PagesRoutePage } from '@/uikit/components-pages/PagesRoutePage';
import { useI18nMapping } from '@/uikit/hook/useI18nMapping';
import { i18nConfig } from '@config/i18n';
import { COMMON_ADMIN_TITLE } from '@config/i18n-identifier/common/common';
import { demoUiI18n } from '@config/i18n-mapping/demoUiI18n';
import type { PagesRouteParamsType } from '@server/render/PagesRouteParams';
import { PagesRouteParams } from '@server/render/PagesRouteParams';
import type { GetStaticPropsContext } from 'next';

interface DemoUIProps {
  messages: Record<string, string>;
}

const namespace = 'page_demo-ui';

export default function DemoUI({}: DemoUIProps) {
  const i18nInterface = useMemo(() => {
    return {
      ...demoUiI18n,
      adminTitle: COMMON_ADMIN_TITLE
    };
  }, []);
  const seoMetadata = useI18nMapping(i18nInterface);

  return (
    <PagesRoutePage
      data-testid="DemoUIPage"
      tt={{ title: seoMetadata.title, adminTitle: seoMetadata.adminTitle }}
      showAdminButton={false}
      showAuthButton
      authButtonLoginOnly
    >
      <ClientSeo i18nInterface={seoMetadata} />
      <div data-testid="DemoUI" className="bg-primary min-h-screen">
        <DemoUiShowcase />
      </div>
    </PagesRoutePage>
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
