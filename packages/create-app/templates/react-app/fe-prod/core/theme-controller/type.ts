import { JSONStorage } from '@qlover/fe-utils';

export type ThemeControllerState = {
  theme: string;
};

export type ThemeConfig = {
  domAttribute: string;
  defaultTheme: string;
  target: string;
  supportedThemes: string[];
  storageKey: string;
  styleThemeKeyTemplate: string;
  styleKeyTemplate: string;
  colorsValueTemplate: string;
  colors: Record<string, unknown>;
};

export interface ThemeControllerProps extends ThemeConfig {
  storage?: JSONStorage;
}
