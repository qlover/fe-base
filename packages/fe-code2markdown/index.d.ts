import {
  CommentTag,
  CommentDisplayPart,
  Type,
  ParameterReflection,
  DeclarationReflection,
  ProjectReflection,
  Application,
  ReflectionGroup
} from 'typedoc';
import { Logger } from '@qlover/fe-utils';

declare class DeclarationReflectionParser {
  /**
   * Creates a new DeclarationReflectionParser instance
   *
   * @param {ProjectReflection} project - The TypeDoc project reflection to parse
   */
  constructor(project: ProjectReflection);
  project: ProjectReflection;

  /**
   * Gets the content of a specific tag from block tags
   *
   * @param {CommentTag[]} blockTags - Array of comment block tags
   * @param {string} tag - The tag name to find
   * @returns {string|null} The tag content or null if not found
   */
  getOneBlockTags(blockTags: CommentTag[], tag: string): string | null;

  /**
   * Gets all contents of a specific tag from block tags
   *
   * @param {CommentTag[]} blockTags - Array of comment block tags
   * @param {string} tag - The tag name to find
   * @returns {CommentDisplayPart[]} Array of comment display parts
   */
  getBlockTags(blockTags: CommentTag[], tag: string): CommentDisplayPart[];

  /**
   * Processes parameter type, handling generics
   *
   * @param {Type} type - The parameter type
   * @param {string} name - The parameter name
   * @returns {string} Formatted type string
   */
  getParamType(type: Type, name: string): string;

  /**
   * Converts summary parts to template-friendly format
   *
   * @param {CommentDisplayPart[]} summary - Array of comment display parts
   * @returns {CommentDisplayPart[]} Processed summary list
   */
  toTemplateSummaryList(summary: CommentDisplayPart[]): CommentDisplayPart[];

  /**
   * Converts a summary part to template-friendly format
   *
   * @param {CommentDisplayPart} summary - The comment display part
   * @param {string} [tag] - Optional tag name
   * @returns {CommentDisplayPart & Object} Enhanced comment display part
   */
  toTemplateSummary(
    summary: CommentDisplayPart,
    tag?: string
  ): CommentDisplayPart & {
    isText: boolean;
    isCode: boolean;
    isLink: boolean;
    isInlineTag: boolean;
    tag?: string;
  };

  /**
   * Converts parameter list to template-friendly format
   *
   * @param {ParameterReflection[]} parameters - Array of parameters
   * @param {DeclarationReflection} member - The member declaration
   * @param {DeclarationReflection} classItem - The class declaration
   * @returns {Object[]} Processed parameter list
   */
  toParametersList(
    parameters: ParameterReflection[],
    member: DeclarationReflection,
    classItem: DeclarationReflection
  ): Object[];

  /**
   * Gets block tags excluding @param and @returns tags
   *
   * @param {CommentDisplayPart[]} blockTags - Array of block tags
   * @returns {CommentDisplayPart[]} Filtered block tags
   */
  getBlockTagsNoParamAndReturn(
    blockTags: CommentDisplayPart[]
  ): CommentDisplayPart[];

  /**
   * Converts a parameter to template-friendly format
   *
   * @param {ParameterReflection} child - The parameter reflection
   * @param {DeclarationReflection} [parent] - Optional parent declaration
   * @param {CommentTag[]} [blockTags] - Optional block tags
   * @returns {Object} Processed parameter object
   */
  toParametersListItem(
    child: ParameterReflection,
    parent: DeclarationReflection | undefined,
    blockTags: CommentTag[] | undefined
  ): Object;

  /**
   * Gets the real source of a member
   *
   * @param {DeclarationReflection} member - The member declaration
   * @returns {any} The source information
   */
  getRealSource(member: DeclarationReflection): any;

  /**
   * Gets the return value type
   *
   * @param {DeclarationReflection} member - The member declaration
   * @returns {string|undefined} The return type
   */
  getReturnValue(member: DeclarationReflection): string | undefined;

  /**
   * Adjusts the template result with visibility flags
   *
   * @param {Object} result - The template result
   * @returns {Object} Adjusted result with visibility flags
   */
  adjustResult(result: Object): {
    showSummary: boolean;
    showDescription: boolean;
    showExample: boolean;
    showParameters: boolean;
  };

  /**
   * Filters block tags by tag name
   *
   * @param {CommentDisplayPart[]} blockTags - Array of block tags
   * @param {string} tag - Tag to filter by
   * @returns {CommentDisplayPart[]} Filtered tags
   */
  filterBlockTags(
    blockTags: CommentDisplayPart[],
    tag: string
  ): CommentDisplayPart[];

  /**
   * Filters out specified tags from block tags
   *
   * @param {CommentDisplayPart[]} blockTags - Array of block tags
   * @param {string[]|string} tags - Tags to exclude
   * @returns {CommentDisplayPart[]} Filtered tags
   */
  filterBlockTagsNot(
    blockTags: CommentDisplayPart[],
    tags: string[] | string
  ): CommentDisplayPart[];

  /**
   * Checks if type is a method
   *
   * @param {string} type - The type to check
   * @returns {boolean} True if type is method or constructor
   */
  isMethodType(type: string): boolean;

  /**
   * Converts a member to template-friendly format
   *
   * @param {Object} params - Parameters object
   * @param {DeclarationReflection} params.member - The member declaration
   * @param {ParameterReflection[]} [params.parameters] - Optional parameters
   * @param {string} [params.type] - Optional member type
   * @param {DeclarationReflection} [params.classItem] - Optional class declaration
   * @returns {Object} Template-friendly object
   */
  toTemplateResult({
    member,
    parameters,
    type,
    classItem
  }: {
    member: DeclarationReflection;
    parameters?: ParameterReflection[];
    type?: string;
    classItem?: DeclarationReflection;
  }): Object;

  /**
   * Converts class members to template-friendly format
   *
   * @param {DeclarationReflection} reflection - The class reflection
   * @param {DeclarationReflection} classItem - The class declaration
   * @returns {Object[]} Array of processed members
   */
  classMembersToTemplateResults(
    reflection: DeclarationReflection,
    classItem: DeclarationReflection
  ): Object[];

  /**
   * Gets comments from a class item
   *
   * @param {DeclarationReflection} classItem - The class declaration
   * @returns {Object} Object containing summary and block tags
   */
  getComments(classItem: DeclarationReflection): {
    summary: CommentDisplayPart[];
    blockTags: CommentDisplayPart[];
  };
}

declare class ProjectReflectionGenerater {
  /**
   * Creates a new ProjectReflectionGenerater instance
   *
   * @param {Object} options - Configuration options
   * @param {Logger} options.logger - Logger instance
   * @param {string[]} options.entryPoints - Entry point file paths
   * @param {string} options.outputJSONFilePath - JSON output file path
   * @param {string} options.generatePath - Documentation generation path
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

  /**
   * Generates JSON documentation
   */
  generateJson(): Promise<void>;

  /**
   * Generates markdown documentation
   */
  generate(): Promise<void>;

  /**
   * Unescapes HTML entities in text
   *
   * @param {string} text - Text to unescape
   * @returns {string} Unescaped text
   */
  unescapeHtmlEntities(text: string): string;

  /**
   * Gets output path for template result
   *
   * @param {object} templateResult - Template processing result
   * @returns {Object} Output path information
   */
  getTemplateResultOutputPath(templateResult: object): {
    docPaths: {
      docPath: string;
      docFullPath: string;
      docDir: string;
    };
    output: string;
  };

  /**
   * Gets common path between two paths
   *
   * @param {string} fullPath - Full file path
   * @param {string} generatePath - Generation path
   * @returns {string} Common path
   */
  getCommonPath(fullPath: string, generatePath: string): string;

  /**
   * Extracts documentation path from reflection path
   *
   * @param {string} fullPath - Full reflection path
   * @returns {Object} Documentation path information
   */
  extractDocumentationPath(fullPath: string): {
    docPath: string;
    docFullPath: string;
    docDir: string;
  };
}

declare class ProjectReflectionParser {
  /**
   * Creates a new ProjectReflectionParser instance
   *
   * @param {Object} options - Configuration options
   * @param {string[]} options.entryPoints - Entry point file paths
   * @param {string} options.outputPath - Output file path
   * @param {Logger} options.logger - Logger instance
   */
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
  project?: ProjectReflection;
  app?: Application;

  /**
   * Loads project from file
   *
   * @param {string} [path] - Optional path to load from
   * @returns {Promise<ProjectReflection|undefined>} Loaded project
   */
  load(path?: string): Promise<ProjectReflection | undefined>;

  /**
   * Writes project to file
   *
   * @param {ProjectReflection} project - Project to write
   */
  writeTo(project: ProjectReflection): Promise<void>;

  /**
   * Gets TypeDoc application instance
   *
   * @returns {Promise<Application>} TypeDoc application
   */
  getApp(): Promise<Application>;

  /**
   * Gets classes from project
   *
   * @param {ProjectReflection} project - Project reflection
   * @returns {DeclarationReflection[]} Array of class declarations
   */
  getClassess(project: ProjectReflection): DeclarationReflection[];

  /**
   * Parses level 2 children
   *
   * @param {DeclarationReflection} rootChild - Root child declaration
   * @param {ReflectionGroup} group - Reflection group
   * @param {DeclarationReflectionParser} drp - Parser instance
   * @returns {Object[]} Parsed children
   */
  parseLevel2Children(
    rootChild: DeclarationReflection,
    group: ReflectionGroup,
    drp: DeclarationReflectionParser
  ): Object[];

  /**
   * Parses project with groups
   *
   * @param {ProjectReflection} project - Project reflection
   * @returns {Object[]} Parsed groups
   */
  parseWithGroups(project: ProjectReflection): Object[];
}
