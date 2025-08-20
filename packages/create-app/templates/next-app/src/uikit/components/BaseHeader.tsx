// import ThemeSwitcher from '@/uikit/components/ThemeSwitcher';
import Link from 'next/link';

export default function BaseHeader() {
  return (
    <header
      data-testid="base-header"
      className="h-14 bg-secondary border-b border-border sticky top-0 z-50"
    >
      <div className="flex items-center justify-between h-full px-4 mx-auto max-w-7xl">
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            {/* <img
              data-testid="base-header-logo"
              src={IOC(PublicAssetsPath).getPath('/logo.svg')}
              alt="logo"
              className="h-8 w-auto"
            /> */}
            <span
              data-testid="base-header-app-name"
              className="ml-2 text-lg font-semibold text-text"
            >
              {"IOC('AppConfig').appName"}
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {/* <ThemeSwitcher /> */}
        </div>
      </div>
    </header>
  );
}
