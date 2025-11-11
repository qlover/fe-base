import { readdirSync } from 'fs';
import { join } from 'path';
import { Ts2Locales } from '@brain-toolkit/ts2locales';
import { i18nConfig } from '../config/i18n';

export async function generateLocales() {
  const locales = i18nConfig.supportedLngs as unknown as string[];
  const getAllTsFiles = (dir: string): string[] => {
    const files: string[] = [];
    const items = readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = join(dir, item.name);
      if (item.isDirectory()) {
        files.push(...getAllTsFiles(fullPath));
      } else if (item.isFile() && item.name.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
    return files;
  };

  const options = getAllTsFiles('./config/Identifier').map((path) => ({
    source: path,
    target: `./public/locales/{{lng}}.json`
  }));

  const ts2Locale = new Ts2Locales(locales);
  for (const value of options) {
    await ts2Locale.generate(value);
  }
}
