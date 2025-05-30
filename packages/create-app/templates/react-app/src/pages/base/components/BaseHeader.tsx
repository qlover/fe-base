import ThemeSwitcher from '@/uikit/components/ThemeSwitcher';
import LocaleLink from '@/uikit/components/LocaleLink';

export default function BaseHeader() {
  return (
    <header className="h-10 bg-[rgb(var(--color-bg-secondary))] border-b border-[rgb(var(--color-border))] sticky top-0 z-50">
      <div className="flex items-center justify-between h-full px-4 mx-auto max-w-7xl">
        <div className="flex items-center">
          <LocaleLink 
            href="/" 
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <img 
              src="/logo.svg" 
              alt="logo" 
              className="h-6 w-auto"
            />
          </LocaleLink>
        </div>
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
