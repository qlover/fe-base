import type { RouteConfigValue } from '@/base/cases/RouterLoader';
import * as identifier from './Identifier';

export const baseRoutes: RouteConfigValue[] = [
  {
    path: '/',
    element: 'base/RedirectPathname',
    meta: {
      category: 'main'
    }
  },
  {
    path: '/:lng',
    element: 'base/Layout',
    meta: {
      category: 'main'
    },
    children: [
      {
        index: true,
        element: 'base/home/HomePage',
        meta: {
          title: identifier.PAGE_HOME_TITLE,
          icon: 'home',
          localNamespace: 'common'
        }
      },
      {
        path: 'about',
        element: 'base/about/AboutPage',
        meta: {
          title: identifier.PAGE_ABOUT_TITLE,
          icon: 'info',
          localNamespace: 'common'
        }
      },
      {
        path: 'jsonStorage',
        element: 'base/jsonStorage/JSONStoragePage',
        meta: {
          title: identifier.PAGE_JSONSTORAGE_TITLE,
          icon: 'info',
          localNamespace: 'common'
        }
      },
      {
        path: 'request',
        element: 'base/request/RequestPage',
        meta: {
          title: identifier.PAGE_REQUEST_TITLE,
          icon: 'info',
          localNamespace: 'common'
        }
      },
      {
        path: 'executor',
        element: 'base/executor/ExecutorPage',
        meta: {
          title: identifier.PAGE_EXECUTOR_TITLE,
          icon: 'info',
          localNamespace: 'common'
        }
      },
      {
        path: 'errorIdentifier',
        element: 'base/errorIdentifier/errorIdentifierPage',
        meta: {
          title: identifier.PAGE_ERROR_IDENTIFIER_TITLE,
          icon: 'info',
          localNamespace: 'common'
        }
      },
      {
        path: '404',
        element: '404',
        meta: {
          category: 'common',
          title: identifier.PAGE_404_TITLE,
          localNamespace: 'common'
        }
      },
      {
        path: '500',
        element: '500',
        meta: {
          category: 'common',
          title: identifier.PAGE_500_TITLE,
          localNamespace: 'common'
        }
      }
    ]
  },

  {
    path: '/:lng',
    element: 'auth/Layout',
    meta: {
      category: 'auth'
    },
    children: [
      {
        index: true,
        element: 'auth/LoginPage'
      },
      {
        path: 'login',
        element: 'auth/LoginPage',
        meta: {
          title: identifier.PAGE_LOGIN_TITLE,
          icon: 'info',
          localNamespace: 'common'
        }
      },
      {
        path: 'register',
        element: 'auth/Register',
        meta: {
          title: identifier.PAGE_REGISTER_TITLE,
          icon: 'info',
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
      title: identifier.PAGE_404_TITLE,
      localNamespace: 'common'
    }
  },
  {
    path: '500',
    element: '500',
    meta: {
      category: 'common',
      title: identifier.PAGE_500_TITLE,
      localNamespace: 'common'
    }
  },
  {
    path: '*',
    element: '404',
    meta: {
      category: 'common',
      title: identifier.PAGE_404_TITLE,
      localNamespace: 'common'
    }
  }
];
