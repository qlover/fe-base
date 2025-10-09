import { Ts2Locales } from '@brain-toolkit/ts2locales';
import { i18nConfig } from '../config/i18n';
import { join } from 'path';
import { readdirSync } from 'fs';

export async function generateLocales() {
  const locales = i18nConfig.supportedLngs as unknown as string[];
  const options = readdirSync('./config/Identifier')
    .map((file) => ({
      file,
      name: file.replace('.ts', ''),
      path: join('./config/Identifier', file)
    }))
    .map(({ path }) => ({
      source: path,
      // You can use namespace
      // target: `./public/locales/{{lng}}/{{${name}}}.json`
      target: `./public/locales/{{lng}}.json`
    }));

  const ts2Locale = new Ts2Locales(locales);
  for (const value of options) {
    await ts2Locale.generate(value);
  }
}
