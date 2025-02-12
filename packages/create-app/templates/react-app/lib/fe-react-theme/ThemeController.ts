import { FeController } from '@lib/fe-react-controller';
import { ThemeControllerProps, ThemeControllerState } from './type';
import { ThemeStateGetter } from './ThemeStateGetter';

export class ThemeController extends FeController<ThemeControllerState> {
  constructor(private props: ThemeControllerProps) {
    super(() => ThemeStateGetter.create(props));

    this.bindToTheme();
  }

  getSupportedThemes(): string[] {
    return this.props.supportedThemes;
  }

  bindToTheme(): void {
    const { theme } = this.getState();

    const { domAttribute } = this.props;

    if (domAttribute) {
      document.documentElement.setAttribute(domAttribute, theme);
    }
  }

  changeTheme(theme: string): void {
    if (theme === ThemeStateGetter.SYSTEM_THEME) {
      theme = ThemeStateGetter.getSystemTheme();
    }

    this.setState({ theme });

    const { storage, storageKey } = this.props;
    if (storage && storageKey) {
      storage.setItem(storageKey, theme);
    }

    this.bindToTheme();
  }
}
