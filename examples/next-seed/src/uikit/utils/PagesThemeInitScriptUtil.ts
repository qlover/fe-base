import { getPagesThemeInitScript as getKitPagesThemeInitScript } from '@qlover/next-kit/common';
import { themeConfig } from '@config/theme';

/**
 * Inline anti-FOUC script for Pages Router `_document`.
 * Mirrors `@wrksz/themes` init: read storageKey, resolve system, set data-theme
 * on `<html>` before body paints (needed on App → Pages full navigations).
 */
export function getPagesThemeInitScript(): string {
  return getKitPagesThemeInitScript({
    storageKey: themeConfig.storageKey,
    domAttribute: themeConfig.domAttribute,
    defaultTheme: themeConfig.defaultTheme,
    supportedThemes: themeConfig.supportedThemes,
    enableSystem: themeConfig.enableSystem
  });
}
