import type { PageWithParams } from '@/base/cases/PageParams';

export interface PageProps extends PageWithParams {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export interface PageLayoutProps extends PageWithParams {
  children: React.ReactNode;
}
