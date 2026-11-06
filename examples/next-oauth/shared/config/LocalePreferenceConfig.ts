/**
 * 界面语言偏好（跟随系统 / 显式 locale）。
 */

import type { LocaleType } from './i18n';

export const LOCALE_PREFERENCE_STORAGE_KEY =
  'next-oauth.localePreference' as const;

export const LOCALE_PREFERENCE_SYSTEM = 'system' as const;

export type LocalePreferenceType = typeof LOCALE_PREFERENCE_SYSTEM | LocaleType;
