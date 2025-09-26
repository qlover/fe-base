import { BaseHeader } from './BaseHeader';
import { ChatRoot } from './ChatRoot';
import type { HTMLAttributes } from 'react';

export interface BaseLayoutProps extends HTMLAttributes<HTMLDivElement> {
  showLogoutButton?: boolean;
  showAdminButton?: boolean;
  mainProps?: HTMLAttributes<HTMLElement>;
}

export function BaseLayout({
  children,
  showLogoutButton,
  showAdminButton,
  mainProps,
  ...props
}: BaseLayoutProps) {
  return (
    <div
      data-testid="BaseLayout"
      className="flex flex-col min-h-screen"
      {...props}
    >
      <BaseHeader
        showLogoutButton={showLogoutButton}
        showAdminButton={showAdminButton}
      />
      <main className="flex flex-1 flex-col bg-primary" {...mainProps}>
        {children}
      </main>

      <ChatRoot />
    </div>
  );
}
