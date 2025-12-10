import type { PageWithParams } from '@/server/AppPageRouteParams';

export interface PageParamsProps extends PageWithParams {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export interface PageLayoutProps extends PageWithParams {
  children: React.ReactNode;
}
