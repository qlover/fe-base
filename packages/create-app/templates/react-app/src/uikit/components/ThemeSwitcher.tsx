import { IOC } from '@/core/IOC';
import { ThemeController } from '@qlover/fe-prod/core/theme-controller';
import { useController } from '@qlover/fe-prod/react/userController';
import { useTranslation } from 'react-i18next';

export default function ThemeSwitcher() {
  const controller = useController(IOC(ThemeController));
  const { theme } = controller.getState();
  const themes = controller.getSupportedThemes();
  const { t } = useTranslation('common');

  return (
    <div className="flex items-center gap-2">
      <label className="text-black" htmlFor="theme-select">
        {t('header.theme.label')}
      </label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => controller.changeTheme(e.target.value)}
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
