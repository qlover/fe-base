import { ThemeService } from '@/base/services/ThemeService';
import { IOC } from '@/core/IOC';
import { useSliceStore } from '@qlover/slice-store-react';
import { useTranslation } from 'react-i18next';

export default function ThemeSwitcher() {
  const themeService = IOC(ThemeService);
  const { theme } = useSliceStore(themeService);
  const themes = themeService.getSupportedThemes();
  const { t } = useTranslation('common');

  return (
    <div className="flex items-center gap-2">
      <label className="text-black" htmlFor="theme-select">
        {t('header.theme.label')}
      </label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => themeService.changeTheme(e.target.value)}
      >
        {themes.map((theme) => (
          <option key={theme} value={theme}>
            {theme}
          </option>
        ))}
      </select>
    </div>
  );
}
