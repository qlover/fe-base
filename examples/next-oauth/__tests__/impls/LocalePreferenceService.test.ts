import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { LocalePreferenceService } from '@/impls/LocalePreferenceService';
import {
  LOCALE_PREFERENCE_STORAGE_KEY,
  LOCALE_PREFERENCE_SYSTEM
} from '@config/LocalePreferenceConfig';

describe('LocalePreferenceService', () => {
  const service = new LocalePreferenceService();
  let storage: Record<string, string>;

  beforeEach(() => {
    storage = {};
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string): string | null => storage[key] ?? null,
        setItem: (key: string, value: string): void => {
          storage[key] = value;
        }
      }
    });
    vi.stubGlobal('navigator', { language: 'zh-CN' });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolveSystemLocale maps BCP47 primary to supported locale', () => {
    expect(service.resolveSystemLocale('zh-CN')).toBe('zh');
    expect(service.resolveSystemLocale('en-US')).toBe('en');
  });

  it('write/read round-trip preference', () => {
    service.write(LOCALE_PREFERENCE_SYSTEM);
    expect(service.read()).toBe(LOCALE_PREFERENCE_SYSTEM);
    expect(storage[LOCALE_PREFERENCE_STORAGE_KEY]).toBe(
      LOCALE_PREFERENCE_SYSTEM
    );

    service.write('en');
    expect(service.read()).toBe('en');
  });

  it('resolveFromPreference follows system when preference is system', () => {
    expect(service.resolveFromPreference(LOCALE_PREFERENCE_SYSTEM)).toBe('zh');
    expect(service.resolveFromPreference('en')).toBe('en');
  });
});
