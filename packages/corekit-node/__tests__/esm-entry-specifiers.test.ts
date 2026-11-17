import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceRoot: string = join(
  dirname(fileURLToPath(import.meta.url)),
  '../src'
);

function readRelativeSpecifiers(relativePath: string): string[] {
  const source: string = readFileSync(join(sourceRoot, relativePath), 'utf8');
  return [...source.matchAll(/from '(\.\/[^']+)'/g)].map(
    (match: RegExpMatchArray): string => match[1]
  );
}

describe('corekit-node ESM 入口', () => {
  it('相对 re-export 必须带 .js，避免 Node ERR_UNSUPPORTED_DIR_IMPORT', () => {
    const specifiers: string[] = [
      ...readRelativeSpecifiers('index.ts'),
      ...readRelativeSpecifiers('encrypt/index.ts')
    ];

    expect(specifiers.length).toBeGreaterThan(0);
    for (const specifier of specifiers) {
      expect(specifier.endsWith('.js')).toBe(true);
    }
  });
});
