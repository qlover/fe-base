import type { PageWithParams } from '@/base/cases/PageParams';

export interface PageProps extends PageWithParams {
  children: React.ReactNode;
}
