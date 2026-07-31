export type PagesThemeInitOptions = {
  storageKey: string;
  /** DOM attribute set on `<html>` (e.g. `data-theme`). */
  domAttribute: string;
  defaultTheme: string;
  supportedThemes: readonly string[];
  enableSystem?: boolean;
};

/**
 * Inline anti-FOUC script for Pages Router `_document`.
 * Pure string helper — lives in `common` so `_document` does not import
 * the React client entry.
 */
export function getPagesThemeInitScript(
  options: PagesThemeInitOptions
): string {
  const storageKey = JSON.stringify(options.storageKey);
  const attribute = JSON.stringify(options.domAttribute);
  const defaultTheme = JSON.stringify(options.defaultTheme);
  const themes = JSON.stringify([...options.supportedThemes]);
  const enableSystem = String(options.enableSystem ?? false);

  return `(function(){try{var k=${storageKey},a=${attribute},d=${defaultTheme},ts=${themes},es=${enableSystem};var s=null;try{s=localStorage.getItem(k)}catch(e){}var t=s&&(ts.indexOf(s)>=0||(es&&s==="system"))?s:d;if(t==="system"){t=es&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute(a,t)}catch(e){}})();`;
}
