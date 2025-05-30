import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { useBaseRoutePage } from '@/uikit/contexts/BaseRouteContext';
import LocaleLink from '@/uikit/components/LocaleLink';

export default function Home() {
  const { t } = useBaseRoutePage();

  const navigationItems = [
    {
      href: '/about',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
      titleColor: 'text-blue-700',
      titleKey: 'about',
      descriptionKey: 'about_description'
    },
    {
      href: '/jsonstorage',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100',
      titleColor: 'text-green-700',
      titleKey: 'jsonstorage',
      descriptionKey: 'jsonstorage_description'
    },
    {
      href: '/request',
      bgColor: 'bg-red-50',
      hoverColor: 'hover:bg-red-100',
      titleColor: 'text-red-700',
      titleKey: 'request',
      descriptionKey: 'request_description'
    },
    {
      href: '/executor',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100',
      titleColor: 'text-purple-700',
      titleKey: 'executor',
      descriptionKey: 'executor_description'
    },
    {
      href: '/errorIdentifier',
      bgColor: 'bg-amber-50',
      hoverColor: 'hover:bg-amber-100',
      titleColor: 'text-amber-700',
      titleKey: 'errorIdentifier',
      descriptionKey: 'errorIdentifier_description'
    }
  ];

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-base))]">
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[rgb(var(--color-text-primary))]">
            {t('welcome')}
          </h1>
          <p className="text-xl text-[rgb(var(--color-text-secondary))] mb-8">
            {t('description')}
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
              className={`
                block rounded-lg p-6
                bg-[rgb(var(--color-bg-secondary))]
                border border-[rgb(var(--color-border))]
                hover:bg-[rgb(var(--color-bg-elevated))]
                transition-colors duration-200
              `}
            >
              <h3
                className={`text-xl font-semibold mb-3 text-[rgb(var(--color-text-primary))]`}
              >
                {t(item.titleKey)}
              </h3>
              <p className="text-[rgb(var(--color-text-secondary))] mb-4">
                {t(item.descriptionKey)}
              </p>
              <Button type="primary" className="w-full">
                {t('Explore')}
              </Button>
            </LocaleLink>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-4 bg-[rgb(var(--color-bg-elevated))]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-[rgb(var(--color-text-primary))]">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-[rgb(var(--color-text-secondary))] mb-8">
            Join us and discover the power of our utilities.
          </p>
          <Button type="primary" size="large" className="px-8">
            Get Started Now
          </Button>
        </div>
      </section>
    </div>
  );
}
