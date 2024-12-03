import fsExtra from 'fs-extra';
import path from 'path';
import { HBSTemplate } from './HBSTemplate.js';
import { Utils } from './Utils.js';
import { ProjectReader } from './ProjectReader.js';
import { TypeDocConverter } from './TypeDocConverter.js';

export class ReflectionGenerater {
  /**
   * @param {Partial<import('../index.d.ts').ReflectionGeneraterContext>} context
   */
  constructor(context) {
    this.context = context;
    this.reader = new ProjectReader(context);
    this.sourceTemplate = new HBSTemplate('context');
  }

  get logger() {
    return this.context.logger;
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
    const tplPath = this.context.options.tplPath;
    this.reader.writeJSON(templateResults, tplPath);
    this.logger.info('Generate JSON file success', tplPath);

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
      this.context.options.entryPoints,
      this.context.options.generatePath,
      fullFileName
    );

    return {
      docPaths,
      output: path.join(docPaths.docDir, name + '.md')
    };
  }
}
