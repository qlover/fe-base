import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

export class Utils {
  /**
   * 解码 HTML 实体
   * @param {string} text
   * @returns {string}
   */
  static unescapeHtmlEntities(text: string): string {
    return text.replace(/&#x60;/g, '`').replace(/&#x27;/g, "'");
  }

  /**
   * 获取两个路径的公共部分
   * @param {string} fullPath 完整路径
   * @param {string} generatePath 目标路径
   * @returns {string} 公共路径
   */
  static getCommonPath(fullPath: string, generatePath: string): string {
    const fullSegments = fullPath.split(path.sep);
    const generateSegments = generatePath.split(path.sep);

    const commonSegments = [];
    for (
      let i = 0;
      i < Math.min(fullSegments.length, generateSegments.length);
      i++
    ) {
      if (fullSegments[i] === generateSegments[i]) {
        commonSegments.push(fullSegments[i]);
      } else {
        break;
      }
    }

    return commonSegments.length
      ? commonSegments.join(path.sep) + path.sep
      : '';
  }

  /**
   * 根据反射路径提取出对应的文档路径
   *
   * @param {string[]} entryPoints 入口点
   * @param {string} generatePath 生成路径
   * @param {string} fullPath 反射路径
   * @param {boolean} removeEntryPrefix 是否移除入口点前缀目录
   * @returns {{docPath: string, docFullPath: string, docDir: string}}
   */
  static extractDocumentationPath(
    entryPoints: string[],
    generatePath: string,
    fullPath: string,
    removeEntryPrefix: boolean = false
  ): { docPath: string; docFullPath: string; docDir: string } {
    // 找到 entryPoint 中的公共部分
    const commonPath = entryPoints.reduce((common, entryPoint) => {
      const currentCommonPath = this.getCommonPath(generatePath, entryPoint);
      return currentCommonPath.length > common.length
        ? currentCommonPath
        : common;
    }, '');

    if (!commonPath) {
      // 计算从 generatePath 到 absoluteFullPath 的完整相对路径
      let relativeFullPath = path.relative(generatePath, fullPath);

      // 如果需要移除入口点前缀，尝试移除
      if (removeEntryPrefix) {
        relativeFullPath = this.removeEntryPointPrefix(
          entryPoints,
          relativeFullPath
        );
      }

      const docFullPath = path.join(generatePath, relativeFullPath);

      return {
        docPath: generatePath,
        docFullPath: docFullPath,
        docDir: path.dirname(docFullPath)
      };
    }

    // 计算从 commonPath 到 fullPath 的完整相对路径
    let relativeFullPath = path.relative(commonPath, fullPath);

    // 如果需要移除入口点前缀，尝试移除
    if (removeEntryPrefix) {
      relativeFullPath = this.removeEntryPointPrefix(
        entryPoints,
        relativeFullPath
      );
    }

    // 生成文档路径，保留完整相对路径
    const docFullPath = path.join(generatePath, relativeFullPath);

    return {
      docPath: generatePath,
      docFullPath,
      docDir: path.dirname(docFullPath)
    };
  }

  /**
   * 移除路径中的入口点前缀
   *
   * @param {string[} entryPoints 入口点数组
   * @param {string} relativePath 相对路径
   * @returns {string} 移除前缀后的路径
   */
  static removeEntryPointPrefix(
    entryPoints: string[],
    relativePath: string
  ): string {
    const normalizedRelativePath = path.normalize(relativePath);

    for (const entryPoint of entryPoints) {
      let normalizedEntryPoint = path.normalize(entryPoint);

      // 如果是文件路径，取目录部分
      if (path.extname(normalizedEntryPoint)) {
        normalizedEntryPoint = path.dirname(normalizedEntryPoint);
      }

      // 将路径分割成段
      const entrySegments = normalizedEntryPoint
        .split(path.sep)
        .filter((seg) => seg && seg !== '.');
      const pathSegments = normalizedRelativePath
        .split(path.sep)
        .filter((seg) => seg && seg !== '.');

      // 从 entryPoint 的末尾和 relativePath 的开头找相交部分
      let matchLength = 0;
      const minLength = Math.min(entrySegments.length, pathSegments.length);

      // 从后向前遍历 entrySegments，从前向后遍历 pathSegments
      for (let i = 0; i < minLength; i++) {
        const entrySegment = entrySegments[entrySegments.length - 1 - i];
        const pathSegment = pathSegments[i];

        if (entrySegment === pathSegment) {
          matchLength = i + 1;
        } else {
          break;
        }
      }

      // 如果找到匹配，移除相交的部分
      if (matchLength > 0) {
        const remainingSegments = pathSegments.slice(matchLength);
        return remainingSegments.join(path.sep);
      }
    }

    return relativePath;
  }

  static getCurrentFilePath(importMeta?: ImportMeta): string {
    if (importMeta?.url) {
      // ESM environment
      return fileURLToPath(importMeta.url);
    } else if (typeof __filename !== 'undefined') {
      // CJS environment
      return __filename;
    } else {
      throw new Error('Unable to determine current file path');
    }
  }

  static getCurrentDirPath(importMeta?: ImportMeta): string {
    return dirname(Utils.getCurrentFilePath(importMeta));
  }
}
