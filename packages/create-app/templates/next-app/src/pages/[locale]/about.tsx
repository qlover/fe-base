import { PagesRouteParams } from '@/server/PagesRouteParams';
import type { PagesRouteParamsType } from '@/server/PagesRouteParams';
import { ClientSeo } from '@/uikit/components/ClientSeo';
import { useI18nInterface } from '@/uikit/hook/useI18nInterface';
import { aboutI18n, i18nConfig } from '@config/i18n';
import type { GetStaticPropsContext } from 'next';

interface AboutProps {
  messages: Record<string, string>;
}

const namespace = 'page_about';

export default function About({}: AboutProps) {
  const seoMetadata = useI18nInterface(aboutI18n);
  return (
    <>
      <ClientSeo i18nInterface={seoMetadata} />
      <div data-testid="About" className="bg-primary h-screen">
        {seoMetadata.title}
      </div>
    </>
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
