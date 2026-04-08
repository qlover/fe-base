import { dirname, relative } from 'path';

/**
 * Strip the configured entry root from a source path (mirrors Formats.removeEntryPrefix).
 */
export function removeEntryPrefixFromPath(
  filePath: string,
  sourcePath: string | undefined
): string {
  if (!sourcePath) {
    return filePath;
  }

  const normalizedFilePath = filePath.replace(/\\/g, '/');
  let entryDir = sourcePath.replace(/\\/g, '/');

  if (entryDir.endsWith('.ts') || entryDir.endsWith('.js')) {
    const lastSlashIndex = entryDir.lastIndexOf('/');
    entryDir =
      lastSlashIndex !== -1 ? entryDir.substring(0, lastSlashIndex) : '';
  }

  if (entryDir.startsWith('./')) {
    entryDir = entryDir.substring(2);
  }

  if (entryDir && !entryDir.endsWith('/')) {
    entryDir += '/';
  }

  if (normalizedFilePath.startsWith(entryDir) && entryDir.length > 0) {
    const result = normalizedFilePath.substring(entryDir.length);
    return result.startsWith('/') ? result.substring(1) : result;
  }

  return filePath;
}

/**
 * Map a TypeScript source path to the relative markdown output path (as used under generatePath).
 */
export function tsSourcePathToOutputMdPath(
  filePath: string,
  options: { sourcePath?: string; removePrefix?: boolean }
): string {
  let processed = filePath.replace(/\\/g, '/');
  if (options.removePrefix) {
    processed = removeEntryPrefixFromPath(processed, options.sourcePath);
  }
  return processed.replace(/\.ts$/, '.md');
}

/**
 * Relative href from one output .md file to another (POSIX-style, `./` when needed).
 */
export function relativeHrefBetweenOutputMdFiles(
  fromOutputMd: string,
  toOutputMd: string
): string {
  const fromDir = dirname(fromOutputMd.replace(/\\/g, '/'));
  const toNorm = toOutputMd.replace(/\\/g, '/');
  let rel = relative(fromDir, toNorm).replace(/\\/g, '/');
  if (!rel.startsWith('.')) {
    rel = `./${rel}`;
  }
  return rel;
}
