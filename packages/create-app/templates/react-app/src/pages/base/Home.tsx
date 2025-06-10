import { Button } from 'antd';
import { useBaseRoutePage } from '@/uikit/contexts/BaseRouteContext';
import LocaleLink from '@/uikit/components/LocaleLink';
import clsx from 'clsx';
import * as i18nKeys from '@config/Identifier/I18n';

export default function Home() {
  const { t } = useBaseRoutePage();

  const navigationItems = [
    {
      href: '/about',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
      titleColor: 'text-blue-700',
      titleKey: i18nKeys.PAGE_ABOUT_TITLE,
      descriptionKey: i18nKeys.PAGE_ABOUT_DESCRIPTION
    },
    {
      href: '/jsonstorage',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100',
      titleColor: 'text-green-700',
      titleKey: i18nKeys.PAGE_JSONSTORAGE_TITLE,
      descriptionKey: i18nKeys.PAGE_JSONSTORAGE_DESCRIPTION
    },
    {
      href: '/request',
      bgColor: 'bg-red-50',
      hoverColor: 'hover:bg-red-100',
      titleColor: 'text-red-700',
      titleKey: i18nKeys.PAGE_REQUEST_TITLE,
      descriptionKey: i18nKeys.PAGE_REQUEST_DESCRIPTION
    },
    {
      href: '/executor',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100',
      titleColor: 'text-purple-700',
      titleKey: i18nKeys.PAGE_EXECUTOR_TITLE,
      descriptionKey: i18nKeys.PAGE_EXECUTOR_DESCRIPTION
    },
    {
      href: '/errorIdentifier',
      bgColor: 'bg-amber-50',
      hoverColor: 'hover:bg-amber-100',
      titleColor: 'text-amber-700',
      titleKey: i18nKeys.PAGE_ERROR_IDENTIFIER_TITLE,
      descriptionKey: i18nKeys.PAGE_ERROR_IDENTIFIER_DESCRIPTION
    }
  ];

  return (
    <div className="min-h-screen bg-primary">
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-text">
            {t(i18nKeys.HOME_WELCOME)}
          </h1>
          <p className="text-xl text-text-secondary mb-8">
            {t(i18nKeys.HOME_DESCRIPTION)}
          </p>
        </div>
      </section>

      {/* Navigation Grid */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {navigationItems.map((item) => (
            <LocaleLink
              key={item.href}
              href={item.href}
              className={clsx(
                'block rounded-lg p-6',
                'bg-secondary',
                'border border-border',
                'hover:bg-elevated',
                'transition-colors duration-200'
              )}
            >
              <h3 className={`text-xl font-semibold mb-3 text-text`}>
                {t(item.titleKey)}
              </h3>
              <p className="text-text-secondary mb-4">
                {t(item.descriptionKey)}
              </p>
              <Button type="primary" className="w-full">
                {t(i18nKeys.HOME_EXPLORE)}
              </Button>
            </LocaleLink>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-4 bg-elevated">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-text">
            {t(i18nKeys.HOME_GET_STARTED_TITLE)}
          </h2>
          <p className="text-lg text-text-secondary mb-8">
            {t(i18nKeys.HOME_GET_STARTED_DESCRIPTION)}
          </p>
          <Button type="primary" size="large" className="px-8">
            {t(i18nKeys.HOME_GET_STARTED_BUTTON)}
          </Button>
        </div>
      </section>
    </div>
  );
}
