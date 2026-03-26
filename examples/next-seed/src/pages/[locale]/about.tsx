import { useMemo } from 'react';
import { ClientSeo } from '@/uikit/components/ClientSeo';
import { PagesRoutePage } from '@/uikit/components-pages/PagesRoutePage';
import { useI18nMapping } from '@/uikit/hook/useI18nMapping';
import { i18nConfig } from '@config/i18n';
import { COMMON_ADMIN_TITLE } from '@config/i18n-identifier/common/common';
import { aboutI18n } from '@config/i18n-mapping/AboutI18n';
import type { PagesRouteParamsType } from '@server/render/PagesRouteParams';
import { PagesRouteParams } from '@server/render/PagesRouteParams';
import type { GetStaticPropsContext } from 'next';

interface AboutProps {
  messages: Record<string, string>;
}

const namespace = 'page_about';

export default function About({}: AboutProps) {
  const i18nInterface = useMemo(() => {
    return {
      ...aboutI18n,
      adminTitle: COMMON_ADMIN_TITLE
    };
  }, []);
  const seoMetadata = useI18nMapping(i18nInterface);

  return (
    <PagesRoutePage
      data-testid="AboutPage"
      tt={{ title: seoMetadata.title, adminTitle: seoMetadata.adminTitle }}
      showAdminButton={false}
    >
      <ClientSeo i18nInterface={seoMetadata} />
      <div data-testid="About" className="bg-primary h-screen">
        {seoMetadata.title}
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
