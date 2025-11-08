import { baseRoutes } from '@config/app.router';
import { Button } from 'antd';
import { clsx } from 'clsx';
import { LocaleLink } from '@/uikit/components/LocaleLink';
import { useBaseRoutePage } from '@/uikit/contexts/BaseRouteContext';
import type { HomeI18nInterface } from '@config/i18n/homeI18n';

const layoutRoutes = baseRoutes.filter(
  (route) => route.element === 'base/Layout'
);

const navigationItems = layoutRoutes[0]!
  .children!.filter((route) => !route.index)
  .map((route) => ({
    href: `/${route.path}`,
    titleKey: route.meta!.title!,
    descriptionKey: route.meta!.description!
  }));

export default function HomePage() {
  const { t, tt } = useBaseRoutePage<HomeI18nInterface>();

  return (
    <div data-testid="HomePage" className="min-h-screen bg-primary">
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-text">
            {tt.welcome}
          </h1>
          <p className="text-xl text-text-secondary mb-8">{tt.description2}</p>
        </div>
      </section>

      {/* Navigation Grid */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {navigationItems.map((item) => (
            <LocaleLink
              data-testid="HomePage"
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
                {tt.explore}
              </Button>
            </LocaleLink>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-4 bg-elevated">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-text">
            {tt.getStartedTitle}
          </h2>
          <p className="text-lg text-text-secondary mb-8">
            {tt.getStartedDescription}
          </p>
          <Button type="primary" size="large" className="px-8">
            {tt.getStartedButton}
          </Button>
        </div>
      </section>
    </div>
  );
}
