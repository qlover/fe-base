import ThemeSwitcher from '@/components/ThemeSwitcher';
import LocaleLink from '@/components/LocaleLink';

export default function BaseHeader() {
  return (
    <header className="h-10 bg-white sticky top-0 z-50">
      <div className="flex items-center justify-between h-full px-2">
        <div className="flex items-center">
          <LocaleLink href="/">
            <img src="/logo.svg" alt="logo" />
          </LocaleLink>
        </div>
        <div className="flex items-center">
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
