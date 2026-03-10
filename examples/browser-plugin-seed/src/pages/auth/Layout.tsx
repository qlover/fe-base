import type { LayoutProps } from '~pages/base/Layout';

export default function AuthLayout({ children }: LayoutProps) {
  return (
    <div
      data-testid="AuthLayout"
      className="fe:flex fe:flex-col fe:items-center fe:justify-center fe:h-full fe:w-80">
      {children}
    </div>
  );
}
