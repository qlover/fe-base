import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const entrySourcePath: string = join(
  dirname(fileURLToPath(import.meta.url)),
  '../src/core/index.ts'
);

describe('corekit-bridge ESM 主入口', () => {
  it('目录 re-export 必须写到 index.js，避免 Node ERR_UNSUPPORTED_DIR_IMPORT', () => {
    const source: string = readFileSync(entrySourcePath, 'utf8');
    const specifiers: string[] = [
      ...source.matchAll(/export \* from '(\.\/[^']+)'/g)
    ].map((match: RegExpMatchArray): string => match[1]);

    expect(specifiers.length).toBeGreaterThan(0);
    for (const specifier of specifiers) {
      expect(specifier.endsWith('/index.js')).toBe(true);
    }
  });
});
