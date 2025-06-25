import type { RouteConfigValue } from '@/base/cases/RouterLoader';
import * as identifier from './Identifier';

export const baseRoutes: RouteConfigValue[] = [
  {
    path: '/',
    element: 'base/RedirectPathname'
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
        element: 'base/HomePage',
        meta: {
          title: identifier.PAGE_HOME_TITLE,
          description: identifier.PAGE_HOME_DESCRIPTION,
          icon: 'home',
          localNamespace: 'common'
        }
      },
      {
        path: 'about',
        element: 'base/AboutPage',
        meta: {
          title: identifier.PAGE_ABOUT_TITLE,
          description: identifier.PAGE_ABOUT_DESCRIPTION,
          icon: 'info',
          localNamespace: 'common'
        }
      },
      {
        path: 'jsonStorage',
        element: 'base/JSONStoragePage',
        meta: {
          title: identifier.PAGE_JSONSTORAGE_TITLE,
          description: identifier.PAGE_JSONSTORAGE_DESCRIPTION,
          icon: 'info',
          localNamespace: 'common'
        }
      },
      {
        path: 'request',
        element: 'base/RequestPage',
        meta: {
          title: identifier.PAGE_REQUEST_TITLE,
          description: identifier.PAGE_REQUEST_DESCRIPTION,
          icon: 'info',
          localNamespace: 'common'
        }
      },
      {
        path: 'executor',
        element: 'base/ExecutorPage',
        meta: {
          title: identifier.PAGE_EXECUTOR_TITLE,
          description: identifier.PAGE_EXECUTOR_DESCRIPTION,
          icon: 'info',
          localNamespace: 'common'
        }
      },
      {
        path: 'errorIdentifier',
        element: 'base/ErrorIdentifierPage',
        meta: {
          title: identifier.PAGE_ERROR_IDENTIFIER_TITLE,
          description: identifier.PAGE_ERROR_IDENTIFIER_DESCRIPTION,
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
          description: identifier.PAGE_404_DESCRIPTION,
          localNamespace: 'common'
        }
      },
      {
        path: '500',
        element: '500',
        meta: {
          category: 'common',
          title: identifier.PAGE_500_TITLE,
          description: identifier.PAGE_500_DESCRIPTION,
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
          description: identifier.PAGE_LOGIN_DESCRIPTION,
          icon: 'info',
          localNamespace: 'common'
        }
      },
      {
        path: 'register',
        element: 'auth/RegisterPage',
        meta: {
          title: identifier.PAGE_REGISTER_TITLE,
          description: identifier.PAGE_REGISTER_DESCRIPTION,
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
      description: identifier.PAGE_404_DESCRIPTION,
      localNamespace: 'common'
    }
  },
  {
    path: '500',
    element: '500',
    meta: {
      category: 'common',
      title: identifier.PAGE_500_TITLE,
      description: identifier.PAGE_500_DESCRIPTION,
      localNamespace: 'common'
    }
  },
  {
    path: '*',
    element: '404',
    meta: {
      category: 'common',
      title: identifier.PAGE_404_TITLE,
      description: identifier.PAGE_404_DESCRIPTION,
      localNamespace: 'common'
    }
  }
];
