import path from 'path';

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
   * @returns {{docPath: string, docFullPath: string, docDir: string}}
   */
  static extractDocumentationPath(
    entryPoints: string[],
    generatePath: string,
    fullPath: string
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
      const relativeFullPath = path.relative(generatePath, fullPath);

      const docFullPath = path.join(generatePath, relativeFullPath);

      return {
        docPath: generatePath,
        docFullPath: docFullPath,
        docDir: path.dirname(docFullPath)
      };
    }

    // 计算从 commonPath 到 fullPath 的完整相对路径
    const relativeFullPath = path.relative(commonPath, fullPath);

    // 生成文档路径，保留完整相对路径
    const docFullPath = path.join(generatePath, relativeFullPath);

    return {
      docPath: generatePath,
      docFullPath,
      docDir: path.dirname(docFullPath)
    };
  }
}
