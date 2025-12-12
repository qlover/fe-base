/**
 * 该文件主要用于 /src/pages 目录下页面路由的类型定义
 */
import type { AppProps } from 'next/app';
import type { NextRouter } from 'next/router';

export type PagesRouterProps = AppProps & {
  router: NextRouter;
};
