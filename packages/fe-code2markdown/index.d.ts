import {
  CommentTag,
  CommentDisplayPart,
  Type,
  ParameterReflection,
  DeclarationReflection,
  ProjectReflection,
  Application,
  ReflectionGroup,
  ReflectionKind
} from 'typedoc';
import { Logger } from '@qlover/fe-utils';

type ValueOf<T> = T[keyof T];
/**
 * FIXME: hbs无法识别 kind 数字类型, 手动转成字符串
 */
declare const ReflectionKindName = {
  [ReflectionKind.Project]: 'Project',
  [ReflectionKind.Module]: 'Module',
  [ReflectionKind.Namespace]: 'Namespace',
  [ReflectionKind.Enum]: 'Enum',
  [ReflectionKind.EnumMember]: 'EnumMember',
  [ReflectionKind.Variable]: 'Variable',
  [ReflectionKind.Function]: 'Function',
  [ReflectionKind.Class]: 'Class',
  [ReflectionKind.Interface]: 'Interface',
  [ReflectionKind.Constructor]: 'Constructor',
  [ReflectionKind.Property]: 'Property',
  [ReflectionKind.Method]: 'Method',
  [ReflectionKind.CallSignature]: 'CallSignature',
  [ReflectionKind.IndexSignature]: 'IndexSignature',
  [ReflectionKind.ConstructorSignature]: 'ConstructorSignature',
  [ReflectionKind.Parameter]: 'Parameter',
  [ReflectionKind.TypeLiteral]: 'TypeLiteral',
  [ReflectionKind.TypeParameter]: 'TypeParameter',
  [ReflectionKind.Accessor]: 'Accessor',
  [ReflectionKind.GetSignature]: 'GetSignature',
  [ReflectionKind.SetSignature]: 'SetSignature',
  [ReflectionKind.TypeAlias]: 'TypeAlias',
  [ReflectionKind.Reference]: 'Reference'
} as const;

export type FileSource = string;
export type HBSTemplateContextMap = Record<
  ValueOf<typeof ReflectionKindName>,
  HBSTemplateContext[]
>;
export type ParserContextMap = Record<FileSource, HBSTemplateContextMap>;
export type IsKindObjects = {
  [key in `is${keyof typeof ReflectionKind}`]: boolean | undefined;
};
export type HBSTemplateContext = IsKindObjects & {
  id: number;
  kind: number;
  name: string;
  kindName: string;
  summaryList: CommentDisplayPart[];
  blockTagsList: CommentDisplayPart[];
  parameters: ParameterReflection[] | undefined;
  descriptionList: CommentDisplayPart[];
  exampleList: (CommentDisplayPart & {
    isText: boolean;
    isCode: boolean;
    isLink: boolean;
    isInlineTag: boolean;
  })[];
  returnValue: string | undefined;
  source: SourceReference[];
  showSummary: boolean;
  showDescription: boolean;
  showExample: boolean;
  showParameters: boolean | undefined;
  members: Object[];
  hasMembers: boolean;
};

/**
 * Parses declaration reflections to extract and format documentation details.
 */
declare class DeclarationReflectionParser {
  /**
   * Initializes a new instance of the DeclarationReflectionParser class.
   * @param project The TypeDoc project reflection to parse.
   * @param logger Logger instance for logging.
   * @param level Optional level for parsing detail.
   */
  constructor(project: ProjectReflection, logger: Logger, level?: number);
  project: ProjectReflection;
  logger: Logger;
  level: number;

  /**
   * Retrieves the content of a specific tag from block tags.
   * @param blockTags Array of comment block tags.
   * @param tag The tag name to find.
   * @returns The tag content or null if not found.
   */
  getOneBlockTags(blockTags: CommentTag[], tag: string): string | null;

  /**
   * Retrieves all contents of a specific tag from block tags.
   * @param blockTags Array of comment block tags.
   * @param tag The tag name to find.
   * @returns Array of comment display parts.
   */
  getBlockTags(blockTags: CommentTag[], tag: string): CommentDisplayPart[];

  /**
   * Processes parameter type, handling generics.
   * @param type The parameter type.
   * @param name The parameter name.
   * @returns Formatted type string.
   */
  getParamType(type: Type, name: string): string;

  /**
   * Converts summary parts to template-friendly format.
   * @param summary Array of comment display parts.
   * @returns Processed summary list.
   */
  toTemplateSummaryList(summary: CommentDisplayPart[]): CommentDisplayPart[];

  /**
   * Converts a summary part to template-friendly format.
   * @param summary The comment display part.
   * @param tag Optional tag name.
   * @returns Enhanced comment display part.
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
   * Converts parameter list to template-friendly format.
   * @param parameters Array of parameters.
   * @param member The member declaration.
   * @param classItem The class declaration.
   * @returns Processed parameter list.
   */
  toParametersList(
    parameters: ParameterReflection[],
    member: DeclarationReflection,
    classItem: DeclarationReflection
  ): Object[];

  /**
   * Gets block tags excluding @param and @returns tags.
   * @param blockTags Array of block tags.
   * @returns Filtered block tags.
   */
  getBlockTagsNoParamAndReturn(
    blockTags: CommentDisplayPart[]
  ): CommentDisplayPart[];

  /**
   * Converts a parameter to template-friendly format.
   * @param child The parameter reflection.
   * @param parent Optional parent declaration.
   * @param blockTags Optional block tags.
   * @returns Processed parameter object.
   */
  toParametersListItem(
    child: ParameterReflection,
    parent?: DeclarationReflection,
    blockTags?: CommentTag[]
  ): Object;

  /**
   * Gets the real source of a member.
   * @param member The member declaration.
   * @returns The source information.
   */
  getRealSource(member: DeclarationReflection): any;

  /**
   * Gets the return value type.
   * @param member The member declaration.
   * @returns The return type.
   */
  getReturnValue(member: DeclarationReflection): string | undefined;

  /**
   * Adjusts the template result with visibility flags.
   * @param result The template result.
   * @returns Adjusted result with visibility flags.
   */
  adjustResult(result: Object): {
    showSummary: boolean;
    showDescription: boolean;
    showExample: boolean;
    showParameters: boolean;
  };

  /**
   * Filters block tags by tag name.
   * @param blockTags Array of block tags.
   * @param tag Tag to filter by.
   * @returns Filtered tags.
   */
  filterBlockTags(
    blockTags: CommentDisplayPart[],
    tag: string
  ): CommentDisplayPart[];

  /**
   * Filters out specified tags from block tags.
   * @param blockTags Array of block tags.
   * @param tags Tags to exclude.
   * @returns Filtered tags.
   */
  filterBlockTagsNot(
    blockTags: CommentDisplayPart[],
    tags: string[] | string
  ): CommentDisplayPart[];

  /**
   * Checks if type is a method.
   * @param type The type to check.
   * @returns True if type is method or constructor.
   */
  isMethodType(type: string): boolean;

  /**
   * Converts a member to template-friendly format.
   * @param params Parameters object.
   * @returns Template-friendly object.
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
   * Converts class members to template-friendly format.
   * @param reflection The class reflection.
   * @param classItem The class declaration.
   * @returns Array of processed members.
   */
  classMembersToTemplateResults(
    reflection: DeclarationReflection,
    classItem: DeclarationReflection
  ): Object[];

  /**
   * Gets comments from a class item.
   * @param classItem The class declaration.
   * @returns Object containing summary and block tags.
   */
  getComments(classItem: DeclarationReflection): {
    summary: CommentDisplayPart[];
    blockTags: CommentDisplayPart[];
  };
}

/**
 * Generates project reflections into documentation formats.
 */
declare class ProjectReflectionGenerater {
  /**
   * Initializes a new instance of the ProjectReflectionGenerater class.
   * @param options Configuration options.
   */
  constructor({
    logger,
    entryPoints,
    outputJSONFilePath,
    generatePath,
    tplPath
  }: {
    logger: Logger;
    entryPoints: string[];
    outputJSONFilePath: string;
    generatePath: string;
    tplPath: string;
  });
  parser: ProjectReflectionParser;
  entryPoints: string[];
  outputJSONFilePath: string;
  generatePath: string;
  tplPath: string;
  logger: Logger;

  /**
   * Generates JSON documentation.
   * @returns Promise resolving to an array of template results.
   */
  generateJson(): Promise<Object[]>;

  /**
   * Generates markdown documentation.
   * @param onlyJson If true, only generates JSON.
   */
  generate(onlyJson: boolean): Promise<void>;

  /**
   * Unescapes HTML entities in text.
   * @param text Text to unescape.
   * @returns Unescaped text.
   */
  unescapeHtmlEntities(text: string): string;

  /**
   * Gets output path for template result.
   * @param templateResult Template processing result.
   * @returns Output path information.
   */
  getTemplateResultOutputPath(templateResult: object): {
    docPaths: { docPath: string; docFullPath: string; docDir: string };
    output: string;
  };

  /**
   * Gets common path between two paths.
   * @param fullPath Full file path.
   * @param generatePath Generation path.
   * @returns Common path.
   */
  getCommonPath(fullPath: string, generatePath: string): string;

  /**
   * Extracts documentation path from reflection path.
   * @param fullPath Full reflection path.
   * @returns Documentation path information.
   */
  extractDocumentationPath(fullPath: string): {
    docPath: string;
    docFullPath: string;
    docDir: string;
  };
}

/**
 * Parses project reflections to extract and format documentation details.
 */
declare class ProjectReflectionParser {
  /**
   * Initializes a new instance of the ProjectReflectionParser class.
   * @param options Configuration options.
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
   * Loads project from file.
   * @param path Optional path to load from.
   * @returns Promise resolving to the loaded project.
   */
  load(path?: string): Promise<ProjectReflection | undefined>;

  /**
   * Writes project to file.
   * @param project Project to write.
   * @param path Optional path to write to.
   */
  writeTo(project: ProjectReflection, path?: string): Promise<void>;

  /**
   * Writes JSON data to a file.
   * @param value Data to write.
   * @param path Path to write to.
   */
  writeJSON(value: any, path: string): void;

  /**
   * Gets TypeDoc application instance.
   * @returns Promise resolving to the TypeDoc application.
   */
  getApp(): Promise<Application>;

  /**
   * Parses project with groups.
   * @param project Project reflection.
   * @returns Array of parsed groups.
   */
  parseWithGroups(project: ProjectReflection): Object[];
}
