'use client';

import {
  ArrowRightIcon,
  CheckCircleIcon,
  CubeTransparentIcon,
  LanguageIcon,
  PaintBrushIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { Link } from '@/i18n/routing';
import { buttonClassName } from '@/uikit/components/Button';
import type { HomeI18nInterface } from '@config/i18n-mapping/HomeI18n';
import { ROUTE_ADMIN, ROUTE_LOGIN } from '@config/route';

const featureIconWrapClassName =
  'w-12 h-12 rounded-full bg-brand/15 flex items-center justify-center mx-auto mb-3 text-brand-active';

const featureIconClassName = 'h-6 w-6';

interface HomeSectionProps {
  tt: HomeI18nInterface;
}

export function HomeHero({ tt }: HomeSectionProps) {
  return (
    <section data-testid="HomeHero" className="py-10 sm:py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex max-w-full items-center gap-2 bg-brand/15 text-brand-active px-3 py-1 rounded-full text-xs sm:text-sm mb-4 sm:mb-6">
          <CheckCircleIcon className="h-4 w-4 shrink-0" aria-hidden />
          <span className="truncate">{tt.heroBadge}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-primary-text mb-3 sm:mb-4 px-1">
          {tt.heroTitle1}
          <br />
          <span className="text-brand-active">{tt.heroTitle2}</span>
        </h1>
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-secondary-text mb-6 sm:mb-8 px-1">
          {tt.heroDesc}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full max-w-md sm:max-w-none mx-auto">
          <Link
            href={ROUTE_LOGIN}
            className={buttonClassName({
              variant: 'primary',
              size: 'lg',
              className: 'w-full sm:w-auto shadow-md'
            })}
          >
            {tt.heroStart}
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
          <Link
            href={ROUTE_ADMIN}
            className={buttonClassName({
              variant: 'secondary',
              size: 'lg',
              className: 'w-full sm:w-auto shadow-sm'
            })}
          >
            <CubeTransparentIcon className="h-5 w-5" />
            {tt.heroDocs}
          </Link>
        </div>
      </div>
    </section>
  );
}

export function HomeFeatures({ tt }: HomeSectionProps) {
  const features = [
    {
      title: tt.featureThemeTitle ?? 'Theme',
      desc:
        tt.featureThemeDesc ?? 'Light / dark theme switching out of the box.',
      icon: PaintBrushIcon
    },
    {
      title: tt.featureI18nTitle ?? 'i18n',
      desc: tt.featureI18nDesc ?? 'next-intl with locale-prefixed routes.',
      icon: LanguageIcon
    },
    {
      title: tt.featureAuthTitle ?? 'Auth',
      desc:
        tt.featureAuthDesc ??
        'Login, register, and JWT session middleware via Supabase Auth.',
      icon: ShieldCheckIcon
    }
  ];

  return (
    <section data-testid="HomeFeatures" className="py-10 sm:py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((feature) => (
            <div
              data-testid="HomeFeatures"
              key={feature.title}
              className="rounded-2xl border border-primary-border bg-primary/40 p-6 text-center"
            >
              <div className={featureIconWrapClassName}>
                <feature.icon className={featureIconClassName} aria-hidden />
              </div>
              <h3 className="text-lg font-semibold text-primary-text mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-secondary-text">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
