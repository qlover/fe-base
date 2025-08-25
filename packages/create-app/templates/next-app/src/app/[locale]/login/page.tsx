import { loginI18n, i18nConfig } from '@config/i18n';
import { getServerI18n } from '@/server/getServerI18n';
import { useI18nInterface } from '@/uikit/hook/useI18nInterface';
import FeatureItem from './FeatureItem';
import LoginForm from './LoginForm';
import type { Metadata } from 'next';

// Generate static params for all supported locales (used for SSG)
export async function generateStaticParams() {
  // Return one entry for each supported locale
  return i18nConfig.supportedLngs.map(locale => ({ locale }));
}

// Allow Next.js to statically generate this page if possible (default behavior)
export const dynamic = 'auto'; // Enable static generation when possible, fallback to dynamic if needed

// Optional: Use revalidate if you want ISR (Incremental Static Regeneration)
// export const revalidate = 3600; // Rebuild every hour (optional)

// Generate localized SEO metadata per locale (Next.js 15+ best practice)
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const tt = await getServerI18n({
    locale,
    i18nInterface: loginI18n
  });

  // Return localized SEO metadata
  return tt;
}

export default function LoginPage() {
  const tt = useI18nInterface(loginI18n);

  return (
    <div
      data-testid='LoginPage'
      className='flex text-xs1 bg-primary min-h-screen'
    >
      {/* Left side - Brand section */}
      <div className='hidden lg:flex bg-secondary lg:w-1/2 p-12 flex-col'>
        <div className='flex items-center gap-3 mb-12'>
          <div className='w-10 h-10 bg-brand rounded-lg'></div>
          <span className='text-2xl font-semibold text-text'>
            {'AppConfig.appName'}
          </span>
        </div>
        <h1 className='text-4xl font-bold text-text mb-4'>{tt.welcome}</h1>
        <p className='text-text-secondary text-lg mb-8'>{tt.subtitle}</p>
        <div className='space-y-4'>
          <FeatureItem icon='🎯' text={tt.feature_ai_paths} />
          <FeatureItem icon='🎯' text={tt.feature_smart_recommendations} />
          <FeatureItem icon='📊' text={tt.feature_progress_tracking} />
        </div>
      </div>

      {/* Right side - Login form */}
      <div className='w-full lg:w-1/2 p-8 sm:p-12 flex items-center justify-center'>
        <div className='w-full max-w-[420px]'>
          <h2 className='text-2xl font-semibold mb-2 text-text'>{tt.title}</h2>
          <p className='text-text-secondary mb-8'>{tt.subtitle}</p>

          <LoginForm tt={tt} />
        </div>
      </div>
    </div>
  );
}
