/**
 * 用户设置中心路由与分区注册。
 */

export const ROUTE_SETTINGS = '/settings' as const;
export const ROUTE_SETTINGS_SECURITY = '/settings/security' as const;
export const ROUTE_SETTINGS_LANGUAGE = '/settings/language' as const;
export const ROUTE_SETTINGS_APPEARANCE = '/settings/appearance' as const;
export const ROUTE_SETTINGS_FEEDBACK = '/settings/feedback' as const;

export const SETTINGS_SECTION = {
  overview: 'overview',
  security: 'security',
  language: 'language',
  appearance: 'appearance',
  feedback: 'feedback'
} as const;

export type SettingsSectionIdType =
  (typeof SETTINGS_SECTION)[keyof typeof SETTINGS_SECTION];

export type SettingsNavItemType = {
  readonly id: SettingsSectionIdType;
  readonly href:
    | typeof ROUTE_SETTINGS
    | typeof ROUTE_SETTINGS_SECURITY
    | typeof ROUTE_SETTINGS_LANGUAGE
    | typeof ROUTE_SETTINGS_APPEARANCE
    | typeof ROUTE_SETTINGS_FEEDBACK;
  readonly titleKey: string;
  readonly hintKey: string;
};

export type SettingsNavGroupType = {
  readonly groupKey: string;
  readonly items: readonly SettingsNavItemType[];
};

/**
 * 侧栏 / 移动列表分区（不含 overview 根入口）。
 */
export const SETTINGS_NAV_GROUPS: readonly SettingsNavGroupType[] = [
  {
    groupKey: 'groupAccount',
    items: [
      {
        id: SETTINGS_SECTION.security,
        href: ROUTE_SETTINGS_SECURITY,
        titleKey: 'navSecurity',
        hintKey: 'navSecurityHint'
      },
      {
        id: SETTINGS_SECTION.language,
        href: ROUTE_SETTINGS_LANGUAGE,
        titleKey: 'navLanguage',
        hintKey: 'navLanguageHint'
      },
      {
        id: SETTINGS_SECTION.appearance,
        href: ROUTE_SETTINGS_APPEARANCE,
        titleKey: 'navAppearance',
        hintKey: 'navAppearanceHint'
      },
      {
        id: SETTINGS_SECTION.feedback,
        href: ROUTE_SETTINGS_FEEDBACK,
        titleKey: 'navFeedback',
        hintKey: 'navFeedbackHint'
      }
    ] as const
  }
] as const;

export const SETTINGS_LOGGED_IN_ROUTES = [
  ROUTE_SETTINGS,
  ROUTE_SETTINGS_SECURITY,
  ROUTE_SETTINGS_LANGUAGE,
  ROUTE_SETTINGS_APPEARANCE,
  ROUTE_SETTINGS_FEEDBACK
] as const;

/**
 * 从 pathname 解析当前分区（忽略 locale 前缀）。
 */
export function resolveSettingsSectionFromPathname(
  pathname: string
): SettingsSectionIdType {
  const normalized = pathname.replace(/\/$/, '');
  if (normalized.endsWith('/settings/security')) {
    return SETTINGS_SECTION.security;
  }
  if (normalized.endsWith('/settings/language')) {
    return SETTINGS_SECTION.language;
  }
  if (normalized.endsWith('/settings/appearance')) {
    return SETTINGS_SECTION.appearance;
  }
  if (normalized.endsWith('/settings/feedback')) {
    return SETTINGS_SECTION.feedback;
  }
  return SETTINGS_SECTION.overview;
}

/**
 * 是否为 Settings 子页（非概览根）。
 */
export function isSettingsDetailPath(pathname: string): boolean {
  return (
    resolveSettingsSectionFromPathname(pathname) !== SETTINGS_SECTION.overview
  );
}
