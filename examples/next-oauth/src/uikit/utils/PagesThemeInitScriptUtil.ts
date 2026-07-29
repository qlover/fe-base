import { themeConfig } from '@config/theme';

/**
 * Inline anti-FOUC script for Pages Router `_document`.
 * Mirrors `@wrksz/themes` init: read storageKey, resolve system, set data-theme
 * on `<html>` before body paints (needed on App → Pages full navigations).
 */
export function getPagesThemeInitScript(): string {
  const storageKey = JSON.stringify(themeConfig.storageKey);
  const attribute = JSON.stringify(themeConfig.domAttribute);
  const defaultTheme = JSON.stringify(themeConfig.defaultTheme);
  const themes = JSON.stringify([...themeConfig.supportedThemes]);
  const enableSystem = String(themeConfig.enableSystem);

  return `(function(){try{var k=${storageKey},a=${attribute},d=${defaultTheme},ts=${themes},es=${enableSystem};var s=null;try{s=localStorage.getItem(k)}catch(e){}var t=s&&(ts.indexOf(s)>=0||(es&&s==="system"))?s:d;if(t==="system"){t=es&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute(a,t)}catch(e){}})();`;
}
