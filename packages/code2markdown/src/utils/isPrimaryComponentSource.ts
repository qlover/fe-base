import { basename } from 'path';

/**
 * 去掉扩展名后的源文件名（`Button.tsx` → `Button`）。
 *
 * @param filePath - 源文件路径
 * @returns 不含扩展名的文件名
 */
export function getSourceFileBasename(filePath: string): string {
  const name = basename(filePath.replace(/\\/g, '/'));
  return name.replace(/\.(tsx|ts|jsx|js)$/i, '');
}

/**
 * 是否「主组件」源文件候选：PascalCase 的 `.tsx`。
 *
 * 不含 `index.tsx`、camelCase 实现文件、`.ts` 协作类。
 *
 * @param filePath - 源文件路径
 * @returns 是否主组件候选
 */
export function isPascalCaseTsxSource(filePath: string): boolean {
  const name = basename(filePath.replace(/\\/g, '/'));
  return /^[A-Z][A-Za-z0-9]*\.tsx$/.test(name);
}
