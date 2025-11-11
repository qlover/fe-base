import { test as base } from '@playwright/test';
import { routerPrefix } from '../../config/common';

type CustomFixtures = {
  routerPrefix: string;
  fullURL: string;
};

/**
 * Custom test fixture that can be extended with additional functionality
 * For example: authentication, mock data, custom page objects, etc.
 */
export const test = base.extend<CustomFixtures>({
  // Provide routerPrefix as a fixture
  routerPrefix: async ({}, use) => {
    await use(routerPrefix);
  },

  fullURL: async ({ baseURL }, use) => {
    await use(baseURL + routerPrefix);
  },

  // Override page fixture to automatically add routerPrefix to goto calls
  page: async ({ page }, use) => {
    const originalGoto = page.goto.bind(page);

    // Override goto method to prepend routerPrefix
    page.goto = async (url, options) => {
      // If url is a relative path (starts with /), prepend routerPrefix
      if (typeof url === 'string' && url.startsWith('/')) {
        url = routerPrefix + url;
      }
      return originalGoto(url, options);
    };

    await use(page);
  }
});

export { expect } from '@playwright/test';
