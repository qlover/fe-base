import type { RouteConfigValue } from '@/interfaces/RouteLoaderInterface';

export const baseNoLocaleRoutes: RouteConfigValue[] = [
  {
    path: '/',
    element: 'base/Layout',
    meta: {
      category: 'main'
    },
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

  {
    path: '404',
    element: '404',
    meta: {
      category: 'common',
      localNamespace: 'common'
    }
  },
  {
    path: '500',
    element: '500',
    meta: {
      category: 'common',
      localNamespace: 'common'
    }
  },
  {
    path: '*',
    element: '404',
    meta: {
      category: 'common',
      localNamespace: 'common'
    }
  }
];
