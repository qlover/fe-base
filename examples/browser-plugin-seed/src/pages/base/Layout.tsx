import type { ReactNode } from 'react';

export interface LayoutProps {
  children?: ReactNode;
}

/**
 * Layout wrapper for main routes. Renders children in place of react-router's Outlet.
 */
export default function Layout({ children }: LayoutProps) {
  return (
    <div
      data-testid="BaseLayout"
      className="fe:flex fe:flex-col fe:items-center fe:justify-center fe:h-full fe:w-80">
      {children}
    </div>
  );
}
