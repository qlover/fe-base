import ThemeSwitcher from '@/uikit/components/ThemeSwitcher';
import LocaleLink from '@/uikit/components/LocaleLink';
import { useBaseRoutePage } from '@/uikit/contexts/BaseRouteContext';

export default function BaseHeader() {
  const { t } = useBaseRoutePage();

  return (
    <header className="h-14 bg-secondary border-b border-border sticky top-0 z-50">
      <div className="flex items-center justify-between h-full px-4 mx-auto max-w-7xl">
        <div className="flex items-center">
          <LocaleLink
            href="/"
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <img src="/logo.svg" alt="logo" className="h-8 w-auto" />
            <span className="ml-2 text-lg font-semibold text-text">
              {t('appName')}
            </span>
          </LocaleLink>
        </div>
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
