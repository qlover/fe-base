import { lstatSync, readdirSync, rmdirSync, statSync, unlinkSync } from 'fs';
import { execSync } from 'child_process';
import { extname, basename } from 'path';

interface ExecCommandOptions {
  cwd: string;
}

/**
 * 获取执行该方法时所在的目录
 * @returns
 */
export const getCurrentPath = (): string => process.cwd();

/**
 * 判断当前路径是否是文件
 * @param path
 * @returns
 */
export const isFile = (path: string): boolean => lstatSync(path).isFile();

/**
 * 判断当前路径是否是目录
 * @param path
 * @returns
 */
export const isDirectory = (path: string): boolean =>
  lstatSync(path).isDirectory();

type FileName = string | { name: string; suffix: string };

/**
 * 如果路径Path的是一个文件则会返回文件名和后罪名，否则返回目录名
 * @param path
 */
export const getFileName = (path: string): FileName => {
  const lastFileNameStr = basename(path);
  if (!isFile(path) && isDirectory(path)) {
    return lastFileNameStr;
  }
  const [name, suffix] = lastFileNameStr.split('.');
  return { name, suffix };
};

/**
 * 获取路径的后缀名
 * @param path
 * @returns
 */
export const getExtensionName = (path: string): string => {
  const name = extname(path);
  if (name === '') return '';
  return name.split('.')[1] as string;
};

/**
 * 执行命令
 * @param command
 * @param options
 */
export const execCommand = (
  command: string,
  options: ExecCommandOptions = { cwd: getCurrentPath() }
): void => {
  const { cwd } = options;
  execSync(command, { stdio: 'inherit', cwd });
};

/**
 * 递归删除目录
 * @param path
 */
export const recursionDelete = (path: string): void => {
  const files = readdirSync(path);
  for (const file of files) {
    const newpath = `${path}/${file}`;
    const stats = statSync(newpath);
    if (stats.isFile()) {
      unlinkSync(newpath);
    } else {
      recursionDelete(newpath);
    }
  }
  // 文件夹里面的都删除之后，删除本文件件
  rmdirSync(path);
};

// console.log('packages/node, path is:', getCurrentPath())
