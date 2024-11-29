import fsExtra from 'fs-extra';
import path from 'path';
import { HBSTemplate } from './HBSTemplate.js';
import { Utils } from './Utils.js';
import { ProjectReader } from './ProjectReader.js';
import { TypeDocConverter } from './TypeDocConverter.js';

export class ReflectionGenerater {
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
    this.reader = new ProjectReader({
      entryPoints,
      outputPath: outputJSONFilePath,
      logger
    });

    this.entryPoints = entryPoints;
    this.outputJSONFilePath = outputJSONFilePath;
    this.generatePath = generatePath;
    this.tplPath = tplPath;
    this.logger = logger;
    this.sourceTemplate = new HBSTemplate('context');
  }

  /**
   * @returns {Promise<import('../index').ParserContextMap>}
   */
  async generateJson() {
    // 为了获取完整的绝对路径，用convert的数据
    const app = await this.reader.getApp();
    const project = await app.convert();

    // save to local file
    await this.reader.writeTo(project);

    const typeDocConverter = new TypeDocConverter({
      project,
      logger: this.logger
    });
    const templateResults = typeDocConverter.getContextMap();

    // FIXME: isDebug is protected, need to find a way to check it
    this.reader.writeJSON(templateResults, this.tplPath);
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

    for (const [fileName, contextMap] of Object.entries(templateResults)) {
      const { output } = this.getTemplateResultOutputPath(fileName);
      const result = this.sourceTemplate.compileSource(contextMap);
      const unescapedResult = Utils.unescapeHtmlEntities(result);

      try {
        fsExtra.ensureFileSync(output);
        fsExtra.writeFileSync(output, unescapedResult, 'utf-8');
        this.logger.info(`Success: ${output}`);
      } catch (error) {
        this.logger.error(`Failed: ${output}`, error);
      }
    }
  }

  /**
   * 获取模板结果的输出路径
   * @param {string} fullFileName
   * @returns {{docPaths: {docPath: string, docFullPath: string, docDir: string}, output: string}}
   */
  getTemplateResultOutputPath(fullFileName) {
    const name = path.basename(fullFileName).split('.').slice(0, -1).join('.');
    const docPaths = Utils.extractDocumentationPath(
      this.entryPoints,
      this.generatePath,
      fullFileName
    );

    return {
      docPaths,
      output: path.join(docPaths.docDir, name + '.md')
    };
  }
}
