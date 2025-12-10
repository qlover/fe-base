/**
 * 该文件主要用于 /src/app 目录下页面路由的类型定义
 */
import type { PageWithParams } from '@/server/AppPageRouteParams';

export interface PageParamsProps extends PageWithParams {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export interface PageLayoutProps extends PageWithParams {
  children: React.ReactNode;
}
