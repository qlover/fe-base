import type { RouteConfigValue } from '@/base/cases/RouterLoader';
import { aboutI18n } from './i18n/aboutI18n';
import { executorI18n } from './i18n/executorI18n';
import { homeI18n } from './i18n/homeI18n';
import { identifiter18n } from './i18n/identifiter18n';
import { jsonStorage18n } from './i18n/jsonStorage18n';
import { login18n } from './i18n/login18n';
import { messageI18n } from './i18n/messageI18n';
import { notFound18n, serverError18n } from './i18n/notFoundI18n';
import { register18n } from './i18n/register18n';
import { request18n } from './i18n/request18n';
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
          localNamespace: 'common',
          i18nInterface: homeI18n
        }
      },
      {
        path: 'about',
        element: 'base/AboutPage',
        meta: {
          title: identifier.PAGE_ABOUT_TITLE,
          description: identifier.PAGE_ABOUT_DESCRIPTION,
          icon: 'info',
          localNamespace: 'common',
          i18nInterface: aboutI18n
        }
      },
      {
        path: 'jsonStorage',
        element: 'base/JSONStoragePage',
        meta: {
          title: identifier.PAGE_JSONSTORAGE_TITLE,
          description: identifier.PAGE_JSONSTORAGE_DESCRIPTION,
          icon: 'info',
          localNamespace: 'common',
          i18nInterface: jsonStorage18n
        }
      },
      {
        path: 'request',
        element: 'base/RequestPage',
        meta: {
          title: identifier.PAGE_REQUEST_TITLE,
          description: identifier.PAGE_REQUEST_DESCRIPTION,
          icon: 'info',
          localNamespace: 'common',
          i18nInterface: request18n
        }
      },
      {
        path: 'executor',
        element: 'base/ExecutorPage',
        meta: {
          title: identifier.PAGE_EXECUTOR_TITLE,
          description: identifier.PAGE_EXECUTOR_DESCRIPTION,
          icon: 'info',
          localNamespace: 'common',
          i18nInterface: executorI18n
        }
      },
      {
        path: 'identifier',
        element: 'base/IdentifierPage',
        meta: {
          title: identifier.PAGE_ERROR_IDENTIFIER_TITLE,
          description: identifier.PAGE_ERROR_IDENTIFIER_DESCRIPTION,
          icon: 'info',
          localNamespace: 'common',
          i18nInterface: identifiter18n
        }
      },
      {
        path: 'message',
        element: 'base/MessagePage',
        meta: {
          title: identifier.PAGE_MESSAGE_TITLE,
          description: identifier.PAGE_MESSAGE_DESCRIPTION,
          icon: 'message',
          localNamespace: 'common',
          i18nInterface: messageI18n
        }
      },
      {
        path: '*',
        element: 'NoRouteFound',
        meta: {
          category: 'common',
          localNamespace: 'common',
          i18nInterface: notFound18n
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
          localNamespace: 'common',
          i18nInterface: login18n
        }
      },
      {
        path: 'register',
        element: 'auth/RegisterPage',
        meta: {
          title: identifier.PAGE_REGISTER_TITLE,
          description: identifier.PAGE_REGISTER_DESCRIPTION,
          icon: 'info',
          localNamespace: 'common',
          i18nInterface: register18n
        }
      },
      {
        path: '*',
        element: 'NoRouteFound',
        meta: {
          category: 'common',
          localNamespace: 'common',
          i18nInterface: notFound18n
        }
      }
    ]
  },

  {
    path: '404',
    element: '404',
    meta: {
      category: 'common',
      localNamespace: 'common',
      i18nInterface: notFound18n
    }
  },
  {
    path: '500',
    element: '500',
    meta: {
      category: 'common',
      localNamespace: 'common',
      i18nInterface: serverError18n
    }
  },
  {
    path: '*',
    element: 'NoRouteFound',
    meta: {
      category: 'common',
      title: identifier.PAGE_404_TITLE,
      description: identifier.PAGE_404_DESCRIPTION,
      localNamespace: 'common',
      i18nInterface: notFound18n
    }
  }
];

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
          title: identifier.PAGE_HOME_TITLE,
          description: identifier.PAGE_HOME_DESCRIPTION,
          icon: 'home',
          localNamespace: 'common',
          i18nInterface: homeI18n
        }
      },
      {
        path: 'about',
        element: 'base/AboutPage',
        meta: {
          title: identifier.PAGE_ABOUT_TITLE,
          description: identifier.PAGE_ABOUT_DESCRIPTION,
          icon: 'info',
          localNamespace: 'common',
          i18nInterface: aboutI18n
        }
      },
      {
        path: 'jsonStorage',
        element: 'base/JSONStoragePage',
        meta: {
          title: identifier.PAGE_JSONSTORAGE_TITLE,
          description: identifier.PAGE_JSONSTORAGE_DESCRIPTION,
          icon: 'info',
          localNamespace: 'common',
          i18nInterface: jsonStorage18n
        }
      },
      {
        path: 'request',
        element: 'base/RequestPage',
        meta: {
          title: identifier.PAGE_REQUEST_TITLE,
          description: identifier.PAGE_REQUEST_DESCRIPTION,
          icon: 'info',
          localNamespace: 'common',
          i18nInterface: request18n
        }
      },
      {
        path: 'executor',
        element: 'base/ExecutorPage',
        meta: {
          title: identifier.PAGE_EXECUTOR_TITLE,
          description: identifier.PAGE_EXECUTOR_DESCRIPTION,
          icon: 'info',
          localNamespace: 'common',
          i18nInterface: executorI18n
        }
      },
      {
        path: 'identifier',
        element: 'base/IdentifierPage',
        meta: {
          title: identifier.PAGE_ERROR_IDENTIFIER_TITLE,
          description: identifier.PAGE_ERROR_IDENTIFIER_DESCRIPTION,
          icon: 'info',
          localNamespace: 'common',
          i18nInterface: identifiter18n
        }
      },
      {
        path: 'message',
        element: 'base/MessagePage',
        meta: {
          title: identifier.PAGE_MESSAGE_TITLE,
          description: identifier.PAGE_MESSAGE_DESCRIPTION,
          icon: 'message',
          localNamespace: 'common',
          i18nInterface: messageI18n
        }
      }
    ]
  },
  {
    path: '/',
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
      localNamespace: 'common',
      i18nInterface: notFound18n
    }
  },
  {
    path: '500',
    element: '500',
    meta: {
      category: 'common',
      localNamespace: 'common',
      i18nInterface: serverError18n
    }
  },
  {
    path: '*',
    element: 'NoRouteFound',
    meta: {
      category: 'common',
      localNamespace: 'common',
      i18nInterface: notFound18n
    }
  }
];
