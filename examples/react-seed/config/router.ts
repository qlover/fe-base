import { routePathLocaleParamKey } from './seed.config';
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

export const pathLocalRoutePrefix = ':' + routePathLocaleParamKey;

export const authRoutes: RouteConfigValue[] = [
  {
    index: true,
    element: 'auth/RedirectToLogin',
    category: 'auth'
  },
  {
    path: 'login',
    element: 'auth/Login',
    category: 'auth',
    meta: {
      title: 'identifier.PAGE_LOGIN_TITLE',
      description: 'identifier.PAGE_LOGIN_DESCRIPTION',
      icon: 'login',
      localNamespace: 'common'
    }
  },
  {
    path: 'register',
    element: 'auth/Register',
    category: 'auth',
    meta: {
      title: 'identifier.PAGE_REGISTER_TITLE',
      description: 'identifier.PAGE_REGISTER_DESCRIPTION',
      icon: 'userPlus',
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
      },
      {
        path: 'login',
        element: 'base/RedirectToHome',
        category: 'main'
      },
      {
        path: 'register',
        element: 'base/RedirectToHome',
        category: 'main'
      }
    ]
  },

  ...authRoutes,

  ...staticRoutes,
  noMatchRoute
];

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
      {
        path: 'login',
        element: 'base/RedirectToHome',
        category: 'main'
      },
      {
        path: 'register',
        element: 'base/RedirectToHome',
        category: 'main'
      },
      ...staticRoutes
    ]
  },

  {
    path: '/' + pathLocalRoutePrefix,
    element: 'auth/Layout',
    category: 'auth',
    children: authRoutes
  },

  noMatchRoute
];
