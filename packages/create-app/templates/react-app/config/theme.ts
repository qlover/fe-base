import { ThemeConfig } from '@qlover/corekit-bridge';

export const themeConfig: ThemeConfig = {
  domAttribute: 'data-theme',
  defaultTheme: 'system',
  target: 'html',
  supportedThemes: ['light', 'dark', 'pink'],
  storageKey: 'fe_theme',
  init: true,
  prioritizeStore: true
};
