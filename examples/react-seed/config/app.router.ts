import { routePathLocaleParamKey } from './react-seed';
import type { RouteConfigValue } from '@/interfaces/RouteLoaderInterface';

const noMatchRoute: RouteConfigValue = {
  path: '*',
  element: '404',
  category: 'general',
  meta: {
    localNamespace: 'common'
  }
};
const staticRoutes: RouteConfigValue[] = [
  {
    path: '404',
    element: '404',
    category: 'general',
    meta: {
      localNamespace: 'common'
    }
  },
  {
    path: '500',
    element: '500',
    category: 'general',
    meta: {
      localNamespace: 'common'
    }
  }
];

export const baseRoutes: RouteConfigValue[] = [
  {
    path: '/',
    element: 'base/Layout',
    category: 'main',
    children: [
      {
        index: true,
        element: 'base/HomePage',
        meta: {
          title: 'identifier.PAGE_HOME_TITLE',
          description: 'identifier.PAGE_HOME_DESCRIPTION',
          icon: 'home',
          localNamespace: 'common'
        }
      }
    ]
  },

  ...staticRoutes,
  noMatchRoute
];

export const pathLocalRoutePrefix = ':' + routePathLocaleParamKey;

export const baseRoutesWithLocale: RouteConfigValue[] = [
  {
    path: '/',
    category: 'general',
    element: 'base/RedirectWithLocalePath'
  },
  {
    path: '/' + pathLocalRoutePrefix,
    element: 'base/Layout',
    category: 'general',
    children: [
      {
        index: true,
        element: 'base/HomePage',
        category: 'main',
        meta: {
          title: 'identifier.PAGE_HOME_TITLE',
          description: 'identifier.PAGE_HOME_DESCRIPTION',
          icon: 'home',
          localNamespace: 'common'
        }
      },
      ...staticRoutes
    ]
  },

  noMatchRoute
];
