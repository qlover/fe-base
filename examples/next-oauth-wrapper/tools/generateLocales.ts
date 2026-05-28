import { readdirSync } from 'fs';
import { isAbsolute, join } from 'path';
import { Ts2Locales } from '@brain-toolkit/ts2locales';
import { i18nConfig } from '../shared/config/i18n';

export type GenerateLocalesOptions = {
  /**
   * Root folder of i18n identifier `.ts` sources.
   * Relative to `projectRoot`, or absolute. Default: `shared/config/i18n-identifier`.
   */
  identifierDir?: string;
};

const DEFAULT_IDENTIFIER_DIR = join('shared', 'config', 'i18n-identifier');

/**
 * @param projectRoot - Project root directory. Defaults to process.cwd() if not provided.
 * @param options - Optional paths; see {@link GenerateLocalesOptions}.
 */
export async function generateLocales(
  projectRoot: string = process.cwd(),
  options?: GenerateLocalesOptions
) {
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

  const identifierDir = options?.identifierDir
    ? isAbsolute(options.identifierDir)
      ? options.identifierDir
      : join(projectRoot, options.identifierDir)
    : join(projectRoot, DEFAULT_IDENTIFIER_DIR);
  const tasks = getAllTsFiles(identifierDir).map((filePath) => ({
    source: filePath,
    target: join(projectRoot, 'public', 'locales', '{{lng}}.json')
  }));

  const ts2Locale = new Ts2Locales(locales);
  for (const value of tasks) {
    await ts2Locale.generate(value);
  }
}
