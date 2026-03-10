import { useRouter } from '@/contexts/RouterContext';
import { useI18nMapping } from '@/hooks/useI18nMapping';
import {
  page404I18n,
  type Page404I18nMapping
} from '@config/i18n-mapping/page.404';

/** 404 Not Found. */
export default function NotFound() {
  const tt = useI18nMapping<Page404I18nMapping>(page404I18n);
  const { navigate } = useRouter();

  return (
    <div
      data-testid="NotFoundPage"
      className="fe:flex fe:min-h-full fe:flex-col fe:items-center fe:justify-center fe:p-4 fe:text-center fe:w-full">
      <div className="fe:mb-6">
        <p className="fe:text-tertiary-text fe:text-6xl fe:font-bold fe:tracking-tight">
          404
        </p>
        <h1 className="fe:text-primary-text fe:mt-2 fe:text-xl fe:font-semibold fe:tracking-tight">
          {tt.title}
        </h1>
        <p className="fe:text-secondary-text fe:mt-1 fe:text-sm">
          {tt.description}
        </p>
      </div>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="fe:bg-brand hover:fe:bg-brand-hover focus:fe:ring-brand fe:rounded-lg fe:px-4 fe:py-2.5 fe:text-sm fe:font-medium fe:text-white fe:transition-colors focus:fe:outline-none focus:fe:ring-2 focus:fe:ring-offset-0">
        {tt.backHome}
      </button>
    </div>
  );
}
