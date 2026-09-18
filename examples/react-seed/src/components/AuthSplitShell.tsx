import { AuthPreferenceBar } from '@/components/AuthPreferenceBar';
import { authHeroMeshStyle } from '@/components/authStyles';
import { BrandLogo } from '@/components/BrandLogo';
import type { ReactNode } from 'react';

type AuthSplitShellProps = {
  testId: string;
  brandLabel: string;
  heroTitle: string;
  heroSubtitle: string;
  features: string[];
  featureTestId: string;
  footerHint: string;
  children: ReactNode;
};

/**
 * Shared login/register split layout: branded hero + form column.
 */
export function AuthSplitShell({
  testId,
  brandLabel,
  heroTitle,
  heroSubtitle,
  features,
  featureTestId,
  footerHint,
  children
}: AuthSplitShellProps) {
  return (
    <div
      data-testid={testId}
      className="grid min-h-screen w-full lg:grid-cols-2"
    >
      <div
        className="relative hidden overflow-hidden lg:block"
        style={authHeroMeshStyle}
      >
        <div
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgb(var(--fe-color-primary-text)) 1px, transparent 0)',
            backgroundSize: '28px 28px'
          }}
        />
        <div
          className="absolute -left-20 -top-20 h-64 w-64 rounded-full opacity-25 blur-3xl"
          style={{ background: 'rgb(var(--fe-color-brand) / 0.45)' }}
        />
        <div
          className="absolute bottom-1/4 -right-16 h-48 w-48 rounded-full opacity-20 blur-2xl"
          style={{ background: 'rgb(var(--fe-color-brand) / 0.35)' }}
        />

        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          <BrandLogo
            sizeClassName="text-[2.75rem]"
            withWordmark
            wordmarkClassName="text-primary-text text-base font-semibold tracking-tight"
          />
          <div className="space-y-8">
            <div>
              <p className="text-brand mb-3 text-xs font-semibold tracking-[0.14em] uppercase">
                {brandLabel}
              </p>
              <h2 className="text-primary-text text-3xl font-semibold tracking-tight xl:text-4xl">
                {heroTitle}
              </h2>
              <p className="text-secondary-text mt-2 max-w-sm text-base leading-relaxed">
                {heroSubtitle}
              </p>
            </div>
            <ul className="space-y-4">
              {features.map((label) => (
                <li
                  key={label}
                  data-testid={featureTestId}
                  className="text-primary-text/90 flex items-center gap-3 text-sm"
                >
                  <span
                    className="bg-brand/15 text-brand flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium"
                    aria-hidden
                  >
                    ✓
                  </span>
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-primary-text/40 flex items-center gap-2">
            <span
              className="h-px flex-1 bg-current opacity-30"
              style={{ maxWidth: '80px' }}
            />
            <span className="text-xs">{footerHint}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center px-4 py-10 sm:px-6 sm:py-14 lg:px-10 xl:px-14">
        <div className="mx-auto w-full max-w-[400px]">
          <div className="mb-8 flex justify-center lg:hidden">
            <BrandLogo
              sizeClassName="text-[2.25rem]"
              withWordmark
              wordmarkClassName="text-primary-text text-base font-semibold tracking-tight"
            />
          </div>
          <AuthPreferenceBar />
          {children}
        </div>
      </div>
    </div>
  );
}
