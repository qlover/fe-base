import { JSONStorage } from '@qlover/fe-corekit';

export type ThemeServiceState = {
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

export interface ThemeServiceProps extends ThemeConfig {
  storage?: JSONStorage;
}
