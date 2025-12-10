import { AppPageRouteParams } from '@/server/AppPageRouteParams';
import { LocaleLink } from '@/uikit/components/LocaleLink';
import { i18nConfig } from '@config/i18n';
import { GetStaticPropsContext } from 'next';
import { useTranslations } from 'next-intl';

export default function About() {
  const t = useTranslations('About');

  return (
    <div className="bg-primary h-screen">
      <p>{t('description')}</p>
      <LocaleLink href="/" title={t('navigateToHome')}>
        {t('navigateToHome')}
      </LocaleLink>
    </div>
  );
}

export async function getStaticProps({
  params
}: GetStaticPropsContext<{ locale: string }>) {
  const pageParams = new AppPageRouteParams({
    locale: params?.locale || i18nConfig.fallbackLng
  });

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
