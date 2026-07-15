'use client';

import {
  ArrowRightIcon,
  BookOpenIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  CodeBracketIcon,
  CubeTransparentIcon,
  ShareIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { Link } from '@/i18n/routing';
import { buttonClassName } from '@/uikit/components/Button';
import { GithubIcon } from '@/uikit/components/icons';
import type { HomeI18nInterface } from '@config/i18n-mapping/HomeI18n';
import {
  API_OAUTH_VERIFY,
  ROUTE_DEVELOPER_APPS,
  ROUTE_DOCS_OAUTH
} from '@config/route';

const featureIconWrapClassName =
  'w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-3 text-brand';

const featureIconClassName = 'h-6 w-6';

interface HomeSectionProps {
  tt: HomeI18nInterface;
}

export function HomeHero({ tt }: HomeSectionProps) {
  return (
    <section data-testid="HomeHero" className="py-10 sm:py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex max-w-full items-center gap-2 bg-brand/10 text-brand px-3 py-1 rounded-full text-xs sm:text-sm mb-4 sm:mb-6">
          <CheckCircleIcon className="h-4 w-4 shrink-0" />
          <span className="truncate">{tt.heroBadge}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-primary-text mb-3 sm:mb-4 px-1">
          {tt.heroTitle1}
          <br />
          <span className="bg-linear-to-r from-brand to-purple-500 bg-clip-text text-transparent">
            {tt.heroTitle2}
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-secondary-text mb-6 sm:mb-8 px-1">
          {tt.heroDesc}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full max-w-md sm:max-w-none mx-auto">
          <Link
            href={ROUTE_DEVELOPER_APPS}
            className={buttonClassName({
              variant: 'primary',
              size: 'lg',
              className: 'w-full sm:w-auto shadow-md'
            })}
          >
            <GithubIcon className="h-5 w-5" />
            {tt.heroStart}
          </Link>
          <Link
            href={ROUTE_DOCS_OAUTH}
            className={buttonClassName({
              variant: 'secondary',
              size: 'lg',
              className: 'w-full sm:w-auto shadow-sm'
            })}
          >
            <BookOpenIcon className="h-5 w-5" />
            {tt.heroDocs}
          </Link>
        </div>
      </div>
    </section>
  );
}

export function HomeArchitecture({ tt }: HomeSectionProps) {
  return (
    <section
      data-testid="HomeArchitecture"
      className="border-t border-primary-border py-10 sm:py-14"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="rounded-xl border border-primary-border bg-elevated/50 p-6 sm:p-8">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-brand mt-0.5 shrink-0">
              <CodeBracketIcon className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-semibold text-primary-text">
              {tt.sectionArchTitle}
            </h2>
          </div>
          <p className="text-sm text-secondary-text leading-relaxed">
            {tt.sectionArchBody}
          </p>
        </div>
        <div className="rounded-xl border border-brand/30 bg-brand/5 p-6 sm:p-8">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-brand mt-0.5 shrink-0">
              <CubeTransparentIcon className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-semibold text-primary-text">
              {tt.sectionDemoTitle}
            </h2>
          </div>
          <p className="text-sm text-secondary-text leading-relaxed">
            {tt.sectionDemoBody}
          </p>
        </div>
      </div>
    </section>
  );
}

export function HomeFeatures({ tt }: HomeSectionProps) {
  const features = [
    {
      icon: <ShieldCheckIcon className={featureIconClassName} />,
      title: tt.feature1Title,
      desc: tt.feature1Desc
    },
    {
      icon: <ShareIcon className={featureIconClassName} />,
      title: tt.feature2Title,
      desc: tt.feature2Desc
    },
    {
      icon: <CloudArrowUpIcon className={featureIconClassName} />,
      title: tt.feature3Title,
      desc: tt.feature3Desc
    }
  ];

  return (
    <section
      id="features"
      data-testid="HomeFeatures"
      className="border-t border-primary-border py-10 sm:py-14"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              data-testid="HomeFeatureCard"
              key={feature.title}
              className="text-center rounded-xl border border-primary-border bg-primary p-6"
            >
              <div className={featureIconWrapClassName}>{feature.icon}</div>
              <p className="font-semibold text-primary-text mb-2">
                {feature.title}
              </p>
              <p className="text-sm text-secondary-text leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeApiSnippet({ tt }: HomeSectionProps) {
  return (
    <section data-testid="HomeApiSnippet" className="bg-elevated py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-sm font-semibold text-primary-text mb-4">
          {tt.apiSnippetTitle}
        </h2>
        <div className="rounded-xl bg-primary shadow-sm border border-primary-border p-5 space-y-3">
          <p className="text-xs text-tertiary-text font-medium uppercase tracking-wide">
            {tt.apiSnippetLogin}
          </p>
          <p className="text-sm font-mono text-secondary-text break-all">
            <span className="text-brand">POST</span> {API_OAUTH_VERIFY}
          </p>
          <p className="text-sm font-mono text-secondary-text break-all">
            <span className="text-brand">GET</span>{' '}
            /oauth/authorize?client_id=your_app&amp;redirect_uri=...
          </p>
          <p className="text-sm font-mono text-secondary-text break-all">
            <span className="text-brand">POST</span> /oauth/token -d
            &quot;grant_type=authorization_code&amp;code=...&quot;
          </p>
        </div>
      </div>
    </section>
  );
}

export function HomeCta({ tt }: HomeSectionProps) {
  return (
    <section
      data-testid="HomeCta"
      className="py-10 sm:py-16 text-center px-4 sm:px-0"
    >
      <h2 className="text-xl sm:text-2xl font-bold text-primary-text mb-3">
        {tt.ctaTitle}
      </h2>
      <p className="text-secondary-text mb-6">{tt.ctaDesc}</p>
      <Link
        href={ROUTE_DEVELOPER_APPS}
        className={buttonClassName({
          variant: 'primary',
          size: 'sm',
          className: 'px-5 py-2.5 shadow-md'
        })}
      >
        {tt.ctaButton}
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </section>
  );
}

export function HomeFooter({ tt }: HomeSectionProps) {
  return (
    <footer
      data-testid="HomeFooter"
      className="bg-primary border-t border-primary-border py-8"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-secondary-text">
        <p>
          © 2026 {tt.title} · {tt.footerTagline}
        </p>
      </div>
    </footer>
  );
}
