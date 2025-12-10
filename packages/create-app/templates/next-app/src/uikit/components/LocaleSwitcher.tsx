import { useLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { LocaleSwitcherSelect } from './LocaleSwitcherSelect';

export function LocaleSwitcher() {
  const locale = useLocale();

  return (
    <LocaleSwitcherSelect
      data-testid="LocaleSwitcher"
      defaultValue={locale}
      label={'label'}
    >
      {routing.locales.map((cur) => (
        <option data-testid="LocaleSwitcher" key={cur} value={cur}>
          {cur}
        </option>
      ))}
    </LocaleSwitcherSelect>
  );
}
