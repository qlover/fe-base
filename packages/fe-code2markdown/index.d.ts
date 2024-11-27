import {
  CommentTag,
  CommentDisplayPart,
  Type,
  ParameterReflection,
  DeclarationReflection,
  ProjectReflection
} from 'typedoc';
import { ProjectReflection, DeclarationReflection } from 'typedoc';
import { Logger } from '@qlover/fe-utils';

declare class DeclarationReflectionParser {
  /**
   * @param {ProjectReflection} project
   */
  constructor(project: ProjectReflection);
  /**
   * @type {ProjectReflection}
   */
  project: ProjectReflection;
  /**
   * 获取一个blockTags中的一个tag的内容
   * @param {CommentTag[]} blockTags
   * @param {string} tag
   * @returns {string|null}
   */
  getOneBlockTags(blockTags: CommentTag[], tag: string): string | null;
  /**
   * 获取一个blockTags中的一个tag的内容
   * @param {CommentTag[]} blockTags
   * @param {string} tag
   * @returns {CommentDisplayPart[]}
   */
  getBlockTags(blockTags: CommentTag[], tag: string): CommentDisplayPart[];
  /**
   * 处理参数类型, 可以是一个范型
   * @param {Type} type
   * @param {string} name
   * @returns {string}
   */
  getParamType(type: Type, name: string): string;
  /**
   * 获取摘要列表
   * @param {CommentDisplayPart[]} summary
   * @returns {CommentDisplayPart[]}
   */
  getSummaryList(summary: CommentDisplayPart[]): CommentDisplayPart[];
  /**
   * 将一个参数列表转换为模板需要的对象
   * @param {ParameterReflection[]} parameters
   * @param {DeclarationReflection} member
   * @param {DeclarationReflection} classItem
   * @returns {Object[]}
   */
  toParametersList(
    parameters: ParameterReflection[],
    member: DeclarationReflection,
    classItem: DeclarationReflection
  ): Object[];
  /**
   * 将一个参数转换为模板需要的对象
   * @param {ParameterReflection} child
   * @param {DeclarationReflection | undefined} parent
   * @param {CommentTag[] | undefined} blockTags
   * @returns {Object}
   */
  toParametersListItem(
    child: ParameterReflection,
    parent: DeclarationReflection | undefined,
    blockTags: CommentTag[] | undefined
  ): Object;
  /**
   *
   * @param {DeclarationReflection} member
   * @returns
   */
  getRealSource(member: DeclarationReflection): any;
  /**
   * 将一个成员转换为模板需要的对象
   * @param {Object} params
   * @param {DeclarationReflection} params.member
   * @param {ParameterReflection[]} params.parameters
   * @param {string} params.type
   * @param {DeclarationReflection} params.classItem
   * @returns {Object}
   */
  toTemplateResult({
    member,
    parameters,
    type,
    classItem
  }: {
    member: DeclarationReflection;
    parameters: ParameterReflection[];
    type: string;
    classItem: DeclarationReflection;
  }): Object;
  /**
   * 检查结果
   * @param {Object} result
   */
  adjustResult(result: Object): {
    showSummary: boolean;
    showDescription: boolean;
    showExample: boolean;
    showParameters: boolean;
  };
  /**
   * 将一个类的成员转换为模板需要的对象
   * @param {DeclarationReflection} reflection
   * @param {DeclarationReflection} classItem
   * @returns {Object[]}
   */
  classMembersToTemplateResults(
    reflection: DeclarationReflection,
    classItem: DeclarationReflection
  ): Object[];
}

declare class ProjectReflectionGenerater {
  /**
   * @param {object} options
   * @param {string} options.generatePath
   * @param {Logger} options.logger
   * @param {string[]} options.entryPoints
   * @param {string} options.outputJSONFilePath
   */
  constructor({
    logger,
    entryPoints,
    outputJSONFilePath,
    generatePath
  }: {
    logger: Logger;
    entryPoints: string[];
    outputJSONFilePath: string;
    generatePath: string;
  });
  parser: ProjectReflectionParser;
  entryPoints: string[];
  outputJSONFilePath: string;
  generatePath: string;
  logger: Logger;
  classTemplate: any;
  getClassTemplate(): any;
  generateJson(): Promise<void>;
  generate(): Promise<void>;
  unescapeHtmlEntities(text: string): string;
  /**
   * 获取模板结果的输出路径
   * @param {object} templateResult
   * @returns {{docPaths: {docPath: string, docFullPath: string, docDir: string}, output: string}}
   */
  getTemplateResultOutputPath(templateResult: object): {
    docPaths: {
      docPath: string;
      docFullPath: string;
      docDir: string;
    };
    output: string;
  };
  composeTemplate(templateResult: any): any;
  /**
   * 提取物理目录结构, 并将结构扁平化成一个数组， 里面的 path 是全路径
   * @returns {Array<{ directory: string, filename: string, fullPath: string, docPath: string }>}
   */
  extractPhysicalPaths(): Array<{
    directory: string;
    filename: string;
    fullPath: string;
    docPath: string;
  }>;
  /**
   * 获取两个路径的公共部分
   * @param {string} fullPath 完整路径
   * @param {string} generatePath 目标路径
   * @returns {string} 公共路径
   */
  getCommonPath(fullPath: string, generatePath: string): string;
  /**
   * 根据反射路径提取出对应的文档路径
   * @param {string} fullPath 反射路径
   * @returns {{docPath: string, docFullPath: string, docDir: string}}
   */
  extractDocumentationPath(fullPath: string): {
    docPath: string;
    docFullPath: string;
    docDir: string;
  };
}

declare class ProjectReflectionParser {
  constructor({
    entryPoints,
    outputPath,
    logger
  }: {
    entryPoints: string[];
    outputPath: string;
    logger: Logger;
  });
  entryPoints: string[];
  outputPath: string;
  logger: Logger;
  load(path: string): Promise<ProjectReflection | undefined>;
  project: ProjectReflection | undefined;
  writeTo(project: ProjectReflection): Promise<void>;
  getApp(): Promise<any>;
  app: any;
  /**
   * 解析类
   * @param {ProjectReflection} project
   * @returns {{class: Object, members: Object[]}[]}
   */
  parseClasses(project: ProjectReflection): {
    class: Object;
    members: Object[];
  }[];
  /**
   * 解析一个类, 返回一个模板需要的对象
   * @param {DeclarationReflection} classItem
   * @param {ProjectReflection} project
   * @returns {{class: Object, members: Object[]}}
   */
  parseClass(
    classItem: DeclarationReflection,
    project: ProjectReflection
  ): {
    class: Object;
    members: Object[];
  };
}
