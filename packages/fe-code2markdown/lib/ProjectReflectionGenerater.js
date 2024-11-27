import fsExtra from 'fs-extra';
import path, { resolve } from 'path';
import Handlebars from 'handlebars';
import { fileURLToPath } from 'url';
import { ProjectReflectionParser } from './ProjectReflectionParser.js';
export class ProjectReflectionGenerater {
  /**
   * @param {object} options
   * @param {string} options.generatePath
   * @param {import('@qlover/fe-utils').Logger} options.logger
   */
  constructor({ logger, entryPoints, outputJSONFilePath, generatePath }) {
    this.parser = new ProjectReflectionParser({
      entryPoints,
      outputPath: outputJSONFilePath
    });
    this.entryPoints = entryPoints;
    this.outputJSONFilePath = outputJSONFilePath;
    this.generatePath = generatePath;
    this.logger = logger;
    this.classTemplate = this.getClassTemplate();
  }

  getClassTemplate() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const rootDir = path.resolve(__dirname, '../');
    // 读取模板文件
    const templateContent = fsExtra.readFileSync(
      path.join(rootDir, 'hbs/class.hbs'),
      'utf-8'
    );

    // 编译模板
    return Handlebars.compile(templateContent);
  }

  async generateJson() {
    const app = await this.parser.getApp();
    const project = await app.convert();
    await this.parser.writeTo(project);
  }

  async generate() {
    // const physicalPaths = this.extractPhysicalPaths();
    // this.logger.info('Physical paths extracted:', physicalPaths);

    // 获取 app 和 project
    // 为了获取完整的绝对路径，用convert的数据
    const app = await this.parser.getApp();
    const project = await app.convert();
    // const project = await this.parser.load();

    // 写入 project
    const templateResults = this.parser.parseClasses(project);
    for (const templateResult of templateResults) {
      this.logger.debug('templateResult:', templateResult.class);
      // this.logger.debug('templateResult:', templateResult.members);
      templateResult.members.forEach((member) => {
        this.logger.debug('member:', member.parameters);
      });
      const outputMdPath = this.getTemplateResultOutputPath(templateResult);
      const result = this.classTemplate(templateResult);

      const unescapedResult = this.unescapeHtmlEntities(result);

      try {
        fsExtra.ensureFileSync(outputMdPath);
        fsExtra.writeFileSync(outputMdPath, unescapedResult, 'utf-8');
        this.logger.debug(`Writing to: ${outputMdPath} success!`);
      } catch (error) {
        this.logger.error(`Writing to: ${outputMdPath} failed!`, error);
      }
    }
  }

  unescapeHtmlEntities(text) {
    return text.replace(/&#x60;/g, '`').replace(/&#x27;/g, "'");
  }

  getTemplateResultOutputPath(templateResult) {
    const resultSource = templateResult.class.source;
    const docPaths = this.extractDocumentationPath(resultSource.fullFileName);

    return path.join(docPaths.docDir, templateResult.class.name + '.md');
  }

  composeTemplate(templateResult) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const rootDir = path.resolve(__dirname, '../');
    // 读取模板文件
    const templateContent = fsExtra.readFileSync(
      path.join(rootDir, 'hbs/class.hbs'),
      'utf-8'
    );

    // 编译模板
    const template = Handlebars.compile(templateContent);

    // 生成结果
    return template(templateResult);
  }

  /**
   * 提取物理目录结构, 并将结构扁平化成一个数组， 里面的 path 是全路径
   * @returns {Array<{ directory: string, filename: string, fullPath: string, docPath: string }>}
   */
  extractPhysicalPaths() {
    const physicalPaths = [];

    const exploreDirectory = (dir) => {
      const files = fsExtra.readdirSync(dir);
      files.forEach((file) => {
        const fullPath = path.join(dir, file);
        if (fsExtra.statSync(fullPath).isDirectory()) {
          exploreDirectory(fullPath);
        } else {
          const directory = path.dirname(fullPath);
          const filename = path.basename(fullPath);
          const relativePath = path.relative(resolve(), fullPath);

          const result = { directory, filename, fullPath, relativePath };

          physicalPaths.push({
            ...result,
            ...this.extractDocumentationPath(result.fullPath)
          });
        }
      });
    };

    this.parser.entryPoints.forEach((entryPoint) => {
      const stats = fsExtra.statSync(entryPoint);
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
   * @param {string} fullPath 反射路径
   * @returns {string}
   */
  extractDocumentationPath(fullPath) {
    // 找到 entryPoint 中的公共部分
    const commonPath = this.entryPoints.reduce((_, entryPoint) => {
      return this.getCommonPath(this.generatePath, entryPoint);
    }, '');

    if (!commonPath) {
      // 计算从 entryPoint 到 fullPath 的完整相对路径
      const relativeFullPath = path.relative(this.generatePath, fullPath);

      const docFullPath = path.join(this.generatePath, relativeFullPath);

      return {
        docPath: this.generatePath,
        docFullPath: docFullPath,
        docDir: path.dirname(docFullPath)
      };
    }

    // 计算从 commonPath 到 fullPath 的完整相对路径
    const relativeFullPath = path.relative(commonPath, fullPath);

    // 生成文档路径，保留完整相对路径
    const docFullPath = path.join(this.generatePath, relativeFullPath);

    return {
      docPath: this.generatePath,
      docFullPath,
      docDir: path.dirname(docFullPath)
    };
  }
}
