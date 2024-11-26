import fs from 'fs';
import path from 'path';

export class ProjectReflectionGenerater {
  /**
   * @param {object} options
   * @param {import('./ProjectReflectionParser').ProjectReflectionParser} options.parser
   * @param {string} options.generatePath
   * @param {import('@qlover/fe-utils').Logger} options.logger
   */
  constructor({ parser, generatePath, logger }) {
    this.parser = parser;
    this.generatePath = generatePath;
    this.logger = logger;
  }

  async generate() {
    const physicalPaths = this.extractPhysicalPaths();
    const reflectionPaths = this.extractReflectionPaths(physicalPaths);
    this.logger.info('Reflection paths extracted:', reflectionPaths);

    // 获取 app 和 project
    const app = await this.parser.getApp();
    const project = await app.convert();

    // 写入 project
    const result = await this.parser.parseClasses(project);
    this.logger.info('Result:', result);
  }

  /**
   * 提取物理目录结构, 并将结构扁平化成一个数组， 里面的 path 是全路径
   * @returns {Array<{ directory: string, filename: string, fullPath: string, docPath: string }>}
   */
  extractPhysicalPaths() {
    const physicalPaths = [];

    const exploreDirectory = (dir) => {
      const files = fs.readdirSync(dir);
      files.forEach((file) => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          exploreDirectory(fullPath);
        } else {
          const directory = path.dirname(fullPath);
          const filename = path.basename(fullPath);

          const result = { directory, filename, fullPath };

          physicalPaths.push({
            ...result,
            ...this.extractDocumentationPath(result)
          });
        }
      });
    };

    this.parser.entryPoints.forEach((entryPoint) => {
      const stats = fs.statSync(entryPoint);
      if (stats.isFile()) {
        const directory = path.dirname(entryPoint);
        exploreDirectory(directory);
      } else if (stats.isDirectory()) {
        exploreDirectory(entryPoint);
      }
    });

    return physicalPaths;
  }

  /**
   * 根据 entryPoints 提取出对应的物理路径
   * @param {string[]} physicalPaths
   * @returns {Array<{ directory: string, filename: string, fullPath: string }>}
   */
  extractEntryPaths(physicalPaths) {
    return physicalPaths.map(({ directory, filename, fullPath }) => {
      return { directory, filename, fullPath };
    });
  }

  /**
   * 根据物理路径提取出对应的反射路径
   * @param {Array<{ directory: string, filename: string, fullPath: string }>} physicalPaths
   * @returns {string[]}
   */
  extractReflectionPaths(physicalPaths) {
    for (const physicalPath of physicalPaths) {
      const content = this.parser.parsePath(physicalPath);
      this.logger.info('Reflection content:', content);
    }
  }

  /**
   * 获取两个路径的公共部分
   * @param {string} fullPath 完整路径
   * @param {string} generatePath 目标路径
   * @returns {string} 公共路径
   */
  getCommonPath(fullPath, generatePath) {
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
   * @param {{ directory: string, filename: string, fullPath: string }} entryPath
   * @returns {string}
   */
  extractDocumentationPath({ fullPath }) {
    // 找到 entryPoint 中的公共部分
    const commonPath = this.entryPoints.reduce((_, entryPoint) => {
      return this.getCommonPath(this.generatePath, entryPoint);
    }, '');

    if (!commonPath) {
      // 计算从 entryPoint 到 fullPath 的完整相对路径
      const relativeFullPath = path.relative(this.generatePath, fullPath);

      return {
        docPath: this.generatePath,
        docFullPath: path.join(this.generatePath, relativeFullPath)
      };
    }

    // 计算从 commonPath 到 fullPath 的完整相对路径
    const relativeFullPath = path.relative(commonPath, fullPath);

    // 生成文档路径，保留完整相对路径
    const docFullPath = path.join(this.generatePath, relativeFullPath);

    return { docPath: this.generatePath, docFullPath };
  }
}
