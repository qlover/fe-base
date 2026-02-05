import { readdirSync } from 'fs';
import { join } from 'path';

export const getAllI18nIdentifierFiles = (dir: string): string[] => {
  const files: string[] = [];
  const items = readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...getAllI18nIdentifierFiles(fullPath));
    } else if (item.isFile() && item.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
};

export function generateTs2LocalesOptions(
  sourcePath: string,
  targetPath: string = './public/locales/{{lng}}/common.json'
) {
  return getAllI18nIdentifierFiles(sourcePath).map((path) => ({
    source: path,
    target: targetPath
  }));
}
