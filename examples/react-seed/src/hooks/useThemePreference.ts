import { useCallback, useEffect, useState } from 'react';
import { useIOC } from '@/hooks/useIOC';
import { I } from '@config/ioc-identifier';
import {
  ThemeMap,
  ThemePreferenceMap,
  themePreferenceStorageKey,
  type ThemeChoice,
  type ThemeId
} from '@config/theme';

function readSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') {
    return ThemeMap.LIGHT;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? ThemeMap.DARK
    : ThemeMap.LIGHT;
}

function readStoredPreference(): ThemeChoice {
  if (typeof window === 'undefined') {
    return ThemePreferenceMap.SYSTEM;
  }
  const raw = window.localStorage.getItem(themePreferenceStorageKey);
  if (
    raw === ThemePreferenceMap.SYSTEM ||
    raw === ThemeMap.LIGHT ||
    raw === ThemeMap.DARK ||
    raw === ThemeMap.PINK
  ) {
    return raw;
  }
  return ThemePreferenceMap.SYSTEM;
}

function resolveTheme(choice: ThemeChoice): ThemeId {
  return choice === ThemePreferenceMap.SYSTEM ? readSystemTheme() : choice;
}

/**
 * Theme preference with `system` (OS light/dark only).
 * Applies resolved theme through ThemeService for `data-theme`.
 */
export function useThemePreference() {
  const themeService = useIOC(I.ThemeService);
  const [preference, setPreferenceState] = useState<ThemeChoice>(
    ThemePreferenceMap.SYSTEM
  );

  useEffect(() => {
    const stored = readStoredPreference();
    setPreferenceState(stored);
    themeService.changeTheme(resolveTheme(stored));
  }, [themeService]);

  useEffect(() => {
    if (preference !== ThemePreferenceMap.SYSTEM) {
      return;
    }
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      themeService.changeTheme(readSystemTheme());
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [preference, themeService]);

  const setPreference = useCallback(
    (choice: ThemeChoice) => {
      setPreferenceState(choice);
      window.localStorage.setItem(themePreferenceStorageKey, choice);
      themeService.changeTheme(resolveTheme(choice));
    },
    [themeService]
  );

  return { preference, setPreference };
}
