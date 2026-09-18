import { useLocale } from '@/hooks/useLocale';
import { useThemePreference } from '@/hooks/useThemePreference';
import { useTranslation } from '@/hooks/useTranslation';
import { i18nConfig, type LocaleType } from '@config/i18n';
import {
  COMMON_LANGUAGE,
  COMMON_THEME,
  HEADER_THEME_DARK,
  HEADER_THEME_DEFAULT,
  HEADER_THEME_LIGHT,
  HEADER_THEME_PINK
} from '@config/i18n-identifier/common';
import { ThemeMap, ThemePreferenceMap, type ThemeChoice } from '@config/theme';
import type { ReactNode, SVGProps } from 'react';

const localeLabels: Record<LocaleType, string> = {
  en: 'EN',
  zh: '中文'
};

const themeOptions: {
  id: ThemeChoice;
  labelKey: string;
  icon: (props: SVGProps<SVGSVGElement>) => ReactNode;
}[] = [
  {
    id: ThemePreferenceMap.SYSTEM,
    labelKey: HEADER_THEME_DEFAULT,
    icon: MonitorIcon
  },
  {
    id: ThemeMap.LIGHT,
    labelKey: HEADER_THEME_LIGHT,
    icon: SunIcon
  },
  {
    id: ThemeMap.DARK,
    labelKey: HEADER_THEME_DARK,
    icon: MoonIcon
  },
  {
    id: ThemeMap.PINK,
    labelKey: HEADER_THEME_PINK,
    icon: HeartIcon
  }
];

function MonitorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      data-testid="MonitorIcon"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      {...props}
    >
      <rect
        x="3.5"
        y="4.5"
        width="17"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M8 19.5h8M12 16.5v3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SunIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      data-testid="SunIcon"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="3.75"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6.1 6.1l1.6 1.6M16.3 16.3l1.6 1.6M17.9 6.1l-1.6 1.6M7.7 16.3l-1.6 1.6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      data-testid="MoonIcon"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      {...props}
    >
      <path
        d="M18.5 14.2A7.2 7.2 0 0 1 9.8 5.5 7.5 7.5 0 1 0 18.5 14.2Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      data-testid="HeartIcon"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      {...props}
    >
      <path
        d="M12 19.2s-6.5-4-8.4-7.2C2.2 9.6 3.4 6.8 6.2 6.2c1.7-.4 3.3.4 4.2 1.7.9-1.3 2.5-2.1 4.2-1.7 2.8.6 4 3.4 2.6 5.8-1.9 3.2-8.2 7.2-8.2 7.2Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const segmentTrackClass =
  'border-primary-border bg-secondary/80 inline-flex items-center rounded-full border p-1 shadow-sm backdrop-blur-sm';

const segmentBtnBase =
  'inline-flex h-8 items-center justify-center rounded-full text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40';

/**
 * Auth toolbar: language + theme (includes follow-system → OS light/dark).
 */
export function AuthPreferenceBar() {
  const { t } = useTranslation();
  const { locale, onChangeLocale } = useLocale();
  const { preference, setPreference } = useThemePreference();

  return (
    <div
      data-testid="auth-preference-bar"
      className="mb-6 flex flex-wrap items-center justify-end gap-3"
      role="group"
      aria-label={`${t(COMMON_LANGUAGE)} / ${t(COMMON_THEME)}`}
    >
      <div
        className={segmentTrackClass}
        role="group"
        aria-label={t(COMMON_LANGUAGE)}
      >
        {i18nConfig.supportedLngs.map((lng) => {
          const active = locale === lng;
          return (
            <button
              key={lng}
              type="button"
              data-testid={`auth-locale-${lng}`}
              aria-pressed={active}
              onClick={() => void onChangeLocale(lng)}
              className={`${segmentBtnBase} min-w-11 px-3 ${
                active
                  ? 'bg-brand text-on-brand shadow-sm'
                  : 'text-secondary-text hover:text-primary-text hover:bg-elevated/80'
              }`}
            >
              {localeLabels[lng]}
            </button>
          );
        })}
      </div>

      <div
        className={segmentTrackClass}
        role="group"
        aria-label={t(COMMON_THEME)}
      >
        {themeOptions.map(({ id, labelKey, icon: Icon }) => {
          const active = preference === id;
          return (
            <button
              key={id}
              type="button"
              data-testid={`auth-theme-${id}`}
              title={t(labelKey)}
              aria-label={t(labelKey)}
              aria-pressed={active}
              onClick={() => setPreference(id)}
              className={`${segmentBtnBase} w-8 ${
                active
                  ? 'bg-brand text-on-brand shadow-sm'
                  : 'text-secondary-text hover:text-primary-text hover:bg-elevated/80'
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
