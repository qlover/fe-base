import ThemeSwitcher from '@/uikit/components/ThemeSwitcher';
import LocaleLink from '@/uikit/components/LocaleLink';
import LanguageSwitcher from '@/uikit/components/LanguageSwitcher';
import { PublicAssetsPath } from '@/base/cases/PublicAssetsPath';
import { IOC } from '@/core/IOC';
import LogoutButton from './LogoutButton';

export default function BaseHeader({
  showLogoutButton
}: {
  showLogoutButton?: boolean;
}) {
  return (
    <header className="h-14 bg-secondary border-b border-border sticky top-0 z-50">
      <div className="flex items-center justify-between h-full px-4 mx-auto max-w-7xl">
        <div className="flex items-center">
          <LocaleLink
            href="/"
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <img
              src={IOC(PublicAssetsPath).getPath('/logo.svg')}
              alt="logo"
              className="h-8 w-auto"
            />
            <span className="ml-2 text-lg font-semibold text-text">
              {IOC('AppConfig').appName}
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
