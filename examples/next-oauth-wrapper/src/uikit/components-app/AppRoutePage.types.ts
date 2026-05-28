import type { HTMLAttributes, ReactNode } from 'react';

export interface AppRoutePageTT {
  title: string;
  adminTitle: string;
  developerTitle?: string;
  /** Optional subtitle shown next to the app title (e.g. developer console). */
  headerSubtitle?: string;
}

export type AppRoutePageRouterKind = 'app' | 'pages';

export interface AppRoutePageProps extends HTMLAttributes<HTMLDivElement> {
  /** App Router (default) or Pages Router — loads a separate bundle for each. */
  routerKind?: AppRoutePageRouterKind;
  showAdminButton?: boolean;
  showDeveloperButton?: boolean;
  showHeaderLogo?: boolean;
  mainProps?: HTMLAttributes<HTMLElement>;
  showAuthButton?: boolean;
  authButtonLoginOnly?: boolean;
  /** Show text label on logout control (home header). */
  authButtonShowLogoutLabel?: boolean;
  /** Show docs/about/developer links in header (default true). Auth pages should set false. */
  showHeaderNav?: boolean;
  headerClassName?: string;
  headerHref?: string;
  headerNav?: ReactNode;
  /** Optional class for the header title text (e.g. brand color on console pages). */
  headerTitleClassName?: string;
  tt: AppRoutePageTT;
}
