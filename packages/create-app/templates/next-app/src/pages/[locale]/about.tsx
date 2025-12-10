import { useTranslations } from 'next-intl';
import type { PagesRouteParamsType } from '@/server/PagesRouteParams';
import { PagesRouteParams } from '@/server/PagesRouteParams';
import { LocaleLink } from '@/uikit/components/LocaleLink';
import { i18nConfig } from '@config/i18n';
import type { GetStaticPropsContext } from 'next';

export default function About() {
  const t = useTranslations('About');

  return (
    <div data-testid="About" className="bg-primary h-screen">
      <p>{t('description')}</p>
      <LocaleLink href="/" title={t('navigateToHome')}>
        {t('navigateToHome')}
      </LocaleLink>
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
