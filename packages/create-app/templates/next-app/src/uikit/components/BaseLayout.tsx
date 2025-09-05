import { BaseHeader } from './BaseHeader';
import type { HTMLAttributes } from 'react';

export interface BaseLayoutProps extends HTMLAttributes<HTMLDivElement> {
  showLogoutButton?: boolean;
  mainProps?: HTMLAttributes<HTMLElement>;
}

export function BaseLayout({
  children,
  showLogoutButton,
  mainProps,
  ...props
}: BaseLayoutProps) {
  return (
    <div
      data-testid="BaseLayout"
      className="flex flex-col min-h-screen"
      {...props}
    >
      <BaseHeader showLogoutButton={showLogoutButton} />
      <main className="flex flex-1 flex-col bg-primary" {...mainProps}>
        {children}
      </main>
    </div>
  );
}
