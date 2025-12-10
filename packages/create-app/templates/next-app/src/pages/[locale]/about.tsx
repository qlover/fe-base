import type { PagesRouteParamsType } from '@/server/PagesRouteParams';
import { PagesRouteParams } from '@/server/PagesRouteParams';
import { i18nConfig } from '@config/i18n';
import type { GetStaticPropsContext } from 'next';

export default function About() {
  return (
    <div data-testid="About" className="bg-primary h-screen">
      Hello About
    </div>
  );
}

export async function getStaticProps({
  params
}: GetStaticPropsContext<PagesRouteParamsType>) {
  const pageParams = new PagesRouteParams(params);

  const messages = await pageParams.getI18nMessages();

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
