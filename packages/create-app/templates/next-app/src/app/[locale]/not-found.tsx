// import { useTranslations } from 'next-intl'; // Client-side translation hook
import { identity as t } from 'lodash';
import { Link } from '@/i18n/routing'; // i18n-aware Link component

export default function NotFound() {
  return (
    <div
      data-testid='NotFound'
      className='space-y-6 py-24 flex flex-col items-center'
    >
      {/* Large translated 404 headline */}
      <h1 className='text-4xl font-bold text-center'>{'title'}</h1>
      {/* Description text, translated */}
      <p className='text-lg text-gray-600 text-center'>{t('description')}</p>
      {/* Link back to home page, translated label */}
      <Link
        href='/'
        className='inline-block rounded-xl bg-gray-900 text-white font-medium px-6 py-3 hover:bg-gray-800 transition'
      >
        {t('backToHome')}
      </Link>
    </div>
  );
}
