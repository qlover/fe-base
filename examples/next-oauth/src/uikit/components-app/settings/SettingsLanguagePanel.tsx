'use client';

import { LocaleRouter } from '@qlover/corekit-bridge/url-helper';
import { useRouter } from 'next/router';
import { useLocale } from 'next-intl';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode
} from 'react';
import { useIOC } from '@/uikit/hook/useIOC';
import {
  LOCALE_PREFERENCE_QUERY_KEYS,
  persistLocaleCookie
} from '@shared/utils/localePreference';
import { localeQueryParam, useLocaleRoutes } from '@config/common';
import { i18nConfig, type LocaleType } from '@config/i18n';
import type { SettingsI18nInterface } from '@config/i18n-mapping/settingsI18n';
import { I } from '@config/ioc-identifiter';
import {
  LOCALE_PREFERENCE_SYSTEM,
  type LocalePreferenceType
} from '@config/LocalePreferenceConfig';
import { SettingsLanguageView } from './SettingsLanguageView';

function isLocalePreference(value: string): value is LocalePreferenceType {
  return (
    value === LOCALE_PREFERENCE_SYSTEM ||
    (i18nConfig.supportedLngs as ReadonlyArray<string>).includes(value)
  );
}

/**
 * 语言分区：hydrate 偏好、跟随系统解析一次、chips 切换。
 */
export function SettingsLanguagePanel({
  tt
}: {
  readonly tt: SettingsI18nInterface;
}): ReactNode {
  const router = useRouter();
  const currentLocale = useLocale() as LocaleType;
  const localePreference = useIOC(I.LocalePreferenceServiceInterface);
  const [isPending, startTransition] = useTransition();
  const [preference, setPreference] =
    useState<LocalePreferenceType>(currentLocale);
  const [systemLanguageDisplay, setSystemLanguageDisplay] = useState('');

  const localeRouter = useMemo(
    () =>
      new LocaleRouter({
        supportedLocales: i18nConfig.supportedLngs,
        mode: useLocaleRoutes ? 'path' : 'query',
        localeQueryParam: localeQueryParam
      }),
    []
  );

  const navigateToLocale = useCallback(
    (nextLocale: LocaleType): void => {
      if (nextLocale === currentLocale || !router.isReady) {
        return;
      }
      persistLocaleCookie(nextLocale);
      const { asPath } = router;
      const url = new URL(asPath, window.location.origin);
      for (const key of LOCALE_PREFERENCE_QUERY_KEYS) {
        url.searchParams.delete(key);
      }
      const cleaned = url.pathname + url.search + url.hash;
      const newPath = localeRouter.switchLocale(
        cleaned,
        currentLocale,
        nextLocale
      );
      startTransition(() => {
        void router.replace(newPath);
      });
    },
    [currentLocale, localeRouter, router]
  );

  useEffect(() => {
    const stored = localePreference.read();
    const nextPreference: LocalePreferenceType = stored ?? currentLocale;
    setPreference(nextPreference);
    setSystemLanguageDisplay(localePreference.formatSystemLanguageDisplay());

    if (nextPreference !== LOCALE_PREFERENCE_SYSTEM) {
      return;
    }
    const resolved = localePreference.resolveFromPreference(nextPreference);
    if (resolved !== currentLocale) {
      navigateToLocale(resolved);
    }
  }, [currentLocale, localePreference, navigateToLocale]);

  const onPick = (value: string): void => {
    if (isPending || !isLocalePreference(value) || value === preference) {
      return;
    }
    localePreference.write(value);
    setPreference(value);
    setSystemLanguageDisplay(localePreference.formatSystemLanguageDisplay());
    const target = localePreference.resolveFromPreference(value);
    navigateToLocale(target);
  };

  return (
    <SettingsLanguageView
      sectionLabel={tt.languageSection}
      hint={tt.languageHint}
      followSystemLabel={tt.languageFollowSystem}
      systemSectionLabel={tt.languageSystemSection}
      systemLanguageDisplay={systemLanguageDisplay}
      selectedValue={preference}
      pending={isPending}
      locales={i18nConfig.supportedLngs.map((code) => ({
        code,
        label:
          i18nConfig.localeNames[code as keyof typeof i18nConfig.localeNames]
      }))}
      onPick={onPick}
    />
  );
}
