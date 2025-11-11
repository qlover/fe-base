import { readdirSync } from 'fs';
import { join } from 'path';

export function generateTs2LocalesOptions() {
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
    target: `./public/locales/{{lng}}/common.json`
  }));

  return options;
}
