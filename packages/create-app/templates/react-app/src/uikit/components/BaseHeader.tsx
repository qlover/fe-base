import { IOCIdentifier } from '@config/IOCIdentifier';
import { PublicAssetsPath } from '@/base/cases/PublicAssetsPath';
import { LanguageSwitcher } from '@/uikit/components/LanguageSwitcher';
import { LocaleLink } from '@/uikit/components/LocaleLink';
import { ThemeSwitcher } from '@/uikit/components/ThemeSwitcher';
import { LogoutButton } from './LogoutButton';
import { useIOC } from '../hooks/useIOC';

export function BaseHeader({
  showLogoutButton
}: {
  showLogoutButton?: boolean;
}) {
  const AppConfig = useIOC(IOCIdentifier.AppConfig);
  const publicAssetsPath = useIOC(PublicAssetsPath);

  return (
    <header
      data-testid="BaseHeader"
      className="h-14 bg-secondary border-b border-border sticky top-0 z-50"
    >
      <div className="flex items-center justify-between h-full px-4 mx-auto max-w-7xl">
        <div className="flex items-center">
          <LocaleLink
            href="/"
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <img
              data-testid="BaseHeader-logo"
              src={publicAssetsPath.getPath('/logo.svg')}
              alt="logo"
              className="h-8 w-auto"
            />
            <span
              data-testid="BaseHeader-app-name"
              className="ml-2 text-lg font-semibold text-text"
            >
              {AppConfig.appName}
            </span>
          </LocaleLink>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <ThemeSwitcher />

          {showLogoutButton && <LogoutButton />}
        </div>
      </div>
    </header>
  );
}
