import fsExtra from 'fs-extra';
import path from 'path';
import Handlebars from 'handlebars';
import { fileURLToPath } from 'url';
import { ProjectReflectionParser } from './ProjectReflectionParser.js';
import { ReflectionKind } from 'typedoc';
import { ReflectionKindName } from './DeclarationReflectionParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../hbs');

class HBSTemplate {
  constructor(hbsPath) {
    this.hbsPath = hbsPath.includes('.hbs') ? hbsPath : hbsPath + '.hbs';

    this.templateContent = fsExtra.readFileSync(
      path.join(rootDir, this.hbsPath),
      'utf-8'
    );
  }

  getTemplate() {
    return this.templateContent;
  }

  /**
   * @param {import('../index.d.ts').HBSTemplateContext} context
   * @param {object} options
   * @returns {string}
   */
  compile(context, options) {
    return Handlebars.compile(this.templateContent)(context, options);
  }

  /**
   * @param {import('../index.d.ts').HBSTemplateContextMap} contextMap
   */
  compileSource(contextMap) {
    const output = [];
    // class -> interface -> type
    const types = [
      ReflectionKindName[ReflectionKind.Class],
      ReflectionKindName[ReflectionKind.Interface],
      ReflectionKindName[ReflectionKind.Type]
    ];
    types.forEach((type) => {
      contextMap[type] &&
        output.push(
          ...contextMap[type].map((context) => this.compile(context))
        );
    });

    // other
    Object.entries(contextMap).forEach(([type, contexts]) => {
      !types.includes(type) &&
        output.push(...contexts.map((context) => this.compile(context)));
    });

    return output.join('\n');
  }
}

export class ProjectReflectionGenerater {
  /**
   * @param {object} options
   * @param {string} options.generatePath
   * @param {import('@qlover/fe-utils').Logger} options.logger
   * @param {string[]} options.entryPoints
   * @param {string} options.outputJSONFilePath
   * @param {string} options.tplPath
   */
  constructor({
    logger,
    entryPoints,
    outputJSONFilePath,
    generatePath,
    tplPath
  }) {
    this.parser = new ProjectReflectionParser({
      entryPoints,
      outputPath: outputJSONFilePath,
      logger
    });
    this.entryPoints = entryPoints;
    this.outputJSONFilePath = outputJSONFilePath;
    this.generatePath = generatePath;
    this.tplPath = tplPath;
    this.logger = logger;
  }

  /**
   * @returns {Promise<import('../index.d.ts').ParserContextMap>}
   */
  async generateJson() {
    // 为了获取完整的绝对路径，用convert的数据
    const app = await this.parser.getApp();
    const project = await app.convert();

    // save to local file
    await this.parser.writeTo(project);

    const templateResults = this.parser.parseWithSources(project);

    // FIXME: isDebug is protected, need to find a way to check it
    this.parser.writeJSON(templateResults, this.tplPath);
    this.logger.info('Generate JSON file success', this.tplPath);

    return templateResults;
  }

  /**
   * @param {boolean} onlyJson
   */
  async generate(onlyJson) {
    const templateResults = await this.generateJson();
    if (onlyJson) {
      this.logger.info('Only generate JSON file');
      return;
    }

    const sourceTemplate = new HBSTemplate('context');

    for (const [fileName, contextMap] of Object.entries(templateResults)) {
      const { output } = this.getTemplateResultOutputPath(fileName);
      const result = sourceTemplate.compileSource(contextMap);
      const unescapedResult = this.unescapeHtmlEntities(result);

      try {
        fsExtra.ensureFileSync(output);
        fsExtra.writeFileSync(output, unescapedResult, 'utf-8');
        this.logger.info(`Success: ${output}`);
      } catch (error) {
        this.logger.error(`Failed: ${output}`, error);
      }
    }
  }

  unescapeHtmlEntities(text) {
    return text.replace(/&#x60;/g, '`').replace(/&#x27;/g, "'");
  }

  /**
   * 获取模板结果的输出路径
   * @param {object} templateResult
   * @returns {{docPaths: {docPath: string, docFullPath: string, docDir: string}, output: string}}
   */
  getTemplateResultOutputPath(fullFileName) {
    const name = path.basename(fullFileName).split('.').slice(0, -1).join('.');
    const docPaths = this.extractDocumentationPath(fullFileName);

    return {
      docPaths,
      output: path.join(docPaths.docDir, name + '.md')
    };
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
   * @returns {{docPath: string, docFullPath: string, docDir: string}}
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
