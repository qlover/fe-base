import { SliceStore } from '@qlover/slice-store-react';
import { ThemeServiceProps, ThemeServiceState } from './type';
import { ThemeStateGetter } from './ThemeStateGetter';

export class ThemeService extends SliceStore<ThemeServiceState> {
  constructor(private props: ThemeServiceProps) {
    super(() => ThemeStateGetter.create(props));

    this.bindToTheme();
  }

  getSupportedThemes(): string[] {
    return this.props.supportedThemes;
  }

  bindToTheme(): void {
    const { theme } = this.state;

    const { domAttribute } = this.props;

    if (domAttribute) {
      document.documentElement.setAttribute(domAttribute, theme);
    }
  }

  changeTheme(theme: string): void {
    if (theme === ThemeStateGetter.SYSTEM_THEME) {
      theme = ThemeStateGetter.getSystemTheme();
    }

    this.emit({ ...this.state, theme });

    const { storage, storageKey } = this.props;
    if (storage && storageKey) {
      storage.setItem(storageKey, theme);
    }

    this.bindToTheme();
  }
}
