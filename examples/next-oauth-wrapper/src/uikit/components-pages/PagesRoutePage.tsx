import { AppRoutePagePages } from '../components-app/AppRoutePagePages';
import type { AppRoutePageProps } from '../components-app/AppRoutePage';

/**
 * Pages Router layout — same header as home, without App Router navigation deps.
 */
export function PagesRoutePage(props: AppRoutePageProps) {
  return <AppRoutePagePages {...props} />;
}
