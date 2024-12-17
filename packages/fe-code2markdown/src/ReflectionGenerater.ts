import fsExtra from 'fs-extra';
import path from 'path';
import { HBSTemplate } from './HBSTemplate.js';
import { Utils } from './Utils.js';
import { ProjectReader } from './ProjectReader.js';
import { TypeDocConverter } from './TypeDocConverter.js';
import { ParserContextMap, ReflectionGeneraterContext } from './type';
import { Logger } from '@qlover/fe-utils';

export class ReflectionGenerater {
  private context: ReflectionGeneraterContext;
  private reader: ProjectReader;
  private sourceTemplate: HBSTemplate;

  constructor(context: Partial<ReflectionGeneraterContext>) {
    this.context = context as ReflectionGeneraterContext;
    this.reader = new ProjectReader(context as ReflectionGeneraterContext);
    this.sourceTemplate = new HBSTemplate('context');
  }

  get logger(): Logger {
    return this.context.logger;
  }

  async generateJson(): Promise<ParserContextMap> {
    // 为了获取完整的绝对路径，用convert的数据
    const app = await this.reader.getApp();
    const project = await app.convert();

    if (!project) {
      throw new Error('Failed to convert project');
    }

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

  async generate(onlyJson: boolean): Promise<void> {
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
   */
  getTemplateResultOutputPath(fullFileName: string): {
    docPaths: { docPath: string; docFullPath: string; docDir: string };
    output: string;
  } {
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
