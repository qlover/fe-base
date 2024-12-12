import {
  CommentTag,
  CommentDisplayPart,
  Type,
  ParameterReflection,
  DeclarationReflection,
  ProjectReflection,
  Application,
  ReflectionKind,
  SourceReference
} from 'typedoc';
import { Logger } from '@qlover/fe-utils';
import { FeScriptContext } from '@qlover/fe-scripts';

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
  parametersList: ParameterReflection[] | undefined;
  descriptionList: CommentDisplayPart[];
  returnValue: string | undefined;
  source: SourceReference[];
  members: object[];
  hasMembers: boolean;
};

/**
 * Represents a Handlebars template.
 *
 * @remarks
 * This class is used to manage and compile Handlebars templates.
 *
 * @example
 * ```typescript
 * const template = new HBSTemplate('path/to/template');
 * const result = template.compile(context);
 * ```
 */
declare class HBSTemplate {
  /**
   * Creates an instance of HBSTemplate.
   *
   * @param hbsPath - The path to the Handlebars template file.
   */
  constructor(hbsPath: string);

  /**
   * Retrieves the template content as a string.
   *
   * @returns The template content.
   */
  getTemplate(): string;

  /**
   * Compiles the template with the given context.
   *
   * @param context - The context to use for compilation.
   * @param options - Optional compilation options.
   * @returns The compiled template as a string.
   */
  compile(context: HBSTemplateContext, options?: object): string;

  /**
   * Compiles multiple templates from a context map.
   *
   * @param contextMap - A map of contexts for compilation.
   * @returns The compiled templates as a single string.
   */
  compileSource(contextMap: HBSTemplateContextMap): string;
}

/**
 * Reads and processes project files.
 *
 * @remarks
 * This class is responsible for loading and writing project reflections.
 *
 * @example
 * ```typescript
 * const reader = new ProjectReader({ entryPoints: ['src'], outputPath: 'dist', logger });
 * const project = await reader.load('path/to/project');
 * ```
 */
declare class ProjectReader {
  /**
   * Creates an instance of ProjectReader.
   *
   * @param options - Configuration options for the reader.
   */
  constructor(options: {
    entryPoints: string[];
    outputPath: string;
    logger: Logger;
  });

  /**
   * Loads a project reflection from a given path.
   *
   * @param path - The path to load the project from.
   * @returns A promise that resolves to the project reflection or undefined.
   */
  load(path: string): Promise<ProjectReflection | undefined>;

  /**
   * Writes a project reflection to a specified path.
   *
   * @param project - The project reflection to write.
   * @param path - The path to write the project to.
   * @returns A promise that resolves when the write is complete.
   */
  writeTo(project: ProjectReflection, path: string): Promise<void>;

  /**
   * Writes a JSON value to a specified path.
   *
   * @param value - The JSON value to write.
   * @param path - The path to write the JSON to.
   */
  writeJSON(value: unknown, path: string): void;

  /**
   * Retrieves the application instance.
   *
   * @returns A promise that resolves to the application instance.
   */
  getApp(): Promise<Application>;
}

export type ReflectionGeneraterOptions = {
  entryPoints: string[];
  outputJSONFilePath: string;
  generatePath: string;
  tplPath: string;
};

export type ReflectionGeneraterContext =
  FeScriptContext<ReflectionGeneraterOptions>;

/**
 * Generates reflections for documentation.
 *
 * @remarks
 * This class is used to generate and manage documentation reflections.
 *
 * @example
 * ```typescript
 * const generator = new ReflectionGenerater({ logger, entryPoints: ['src'], outputJSONFilePath: 'output.json', generatePath: 'docs', tplPath: 'template.hbs' });
 * await generator.generate(false);
 * ```
 */
declare class ReflectionGenerater {
  /**
   * Creates an instance of ReflectionGenerater.
   *
   * @param context - Configuration options for the generator.
   */
  constructor(context: ReflectionGeneraterContext);

  /**
   * Generates documentation reflections.
   *
   * @param onlyJson - Whether to generate only JSON output.
   * @returns A promise that resolves when generation is complete.
   */
  generate(onlyJson: boolean): Promise<void>;

  /**
   * Retrieves the output path for a template result.
   *
   * @param fullFileName - The full file name of the template.
   * @returns An object containing documentation paths and output path.
   */
  getTemplateResultOutputPath(fullFileName: string): {
    docPaths: { docPath: string; docFullPath: string; docDir: string };
    output: string;
  };
}

/**
 * Converts TypeDoc reflections to templates.
 *
 * @remarks
 * This class provides methods to convert TypeDoc reflections into template-friendly formats.
 *
 * @example
 * ```typescript
 * const converter = new TypeDocConverter({ project, logger });
 * const levelValue = converter.getLevelValue(tsValue, docsValue);
 * ```
 */
declare class TypeDocConverter {
  /**
   * Creates an instance of TypeDocConverter.
   *
   * @param params - Parameters for the converter.
   */
  constructor(params: {
    project: ProjectReflection;
    logger: Logger;
    level?: number;
    hasSkipInherited?: boolean;
  });

  /**
   * Retrieves the level value from TypeScript and documentation values.
   *
   * @param tsValue - The TypeScript value.
   * @param docsValue - The documentation value.
   * @returns The level value.
   */
  getLevelValue(tsValue: unknown, docsValue: unknown): unknown;

  /**
   * Wraps a type string for template use.
   *
   * @param typeString - The type string to wrap.
   * @returns The wrapped type string.
   */
  warpType(typeString: string): string;

  /**
   * Retrieves a single block tag from a list of block tags.
   *
   * @param blockTags - The list of block tags.
   * @param tag - The tag to retrieve.
   * @returns The content of the block tag or null.
   */
  getOneBlockTags(blockTags: CommentTag[], tag: string): string | null;

  /**
   * Retrieves block tags from a list of block tags.
   *
   * @param blockTags - The list of block tags.
   * @param tag - The tag to retrieve.
   * @returns The list of comment display parts.
   */
  getBlockTags(blockTags: CommentTag[], tag: string): CommentDisplayPart[];

  /**
   * Retrieves the parameter type as a string.
   *
   * @param type - The type to retrieve.
   * @returns The parameter type as a string.
   */
  getParamType(type: Type): string;

  /**
   * Converts a summary list to a template-friendly format.
   *
   * @param summary - The summary list to convert.
   * @returns The converted summary list.
   */
  toTemplateSummaryList(summary: CommentDisplayPart[]): CommentDisplayPart[];

  /**
   * Converts a summary to a template-friendly format.
   *
   * @param summary - The summary to convert.
   * @param tag - The tag associated with the summary.
   * @returns The converted summary with additional properties.
   */
  toTemplateSummary(
    summary: CommentDisplayPart,
    tag: string
  ): CommentDisplayPart & {
    isText: boolean;
    isCode: boolean;
    isLink: boolean;
    isInlineTag: boolean;
    tag: string;
  };

  /**
   * Converts parameters to a list format for templates.
   *
   * @param parameters - The parameters to convert.
   * @param member - The member reflection.
   * @param classItem - The class item reflection.
   * @returns The list of parameter objects.
   */
  toParametersList(
    parameters: ParameterReflection[],
    member: DeclarationReflection,
    classItem: DeclarationReflection
  ): object[];

  /**
   * Retrieves block tags excluding parameter and return tags.
   *
   * @param blockTags - The list of block tags.
   * @returns The filtered list of comment display parts.
   */
  getBlockTagsNoParamAndReturn(
    blockTags: CommentDisplayPart[]
  ): CommentDisplayPart[];

  /**
   * Converts a parameter to a list item format for templates.
   *
   * @param child - The child parameter reflection.
   * @param parent - The parent declaration reflection.
   * @param blockTags - The block tags associated with the parameter.
   * @returns The parameter list item object.
   */
  toParametersListItem(
    child: ParameterReflection,
    parent: DeclarationReflection | undefined,
    blockTags: CommentTag[] | undefined
  ): object;

  /**
   * Retrieves the real source reference for a member.
   *
   * @param member - The member reflection.
   * @param parent - The parent declaration reflection.
   * @returns The source reference or undefined.
   */
  getRealSource(
    member: DeclarationReflection,
    parent: DeclarationReflection
  ): SourceReference | undefined;

  /**
   * Retrieves the return value as a string.
   *
   * @param member - The member reflection.
   * @returns The return value as a string.
   */
  getReturnValue(member: DeclarationReflection): string;

  /**
   * Filters block tags by a specific tag.
   *
   * @param blockTags - The list of block tags.
   * @param tag - The tag to filter by.
   * @returns The filtered list of comment display parts.
   */
  filterBlockTags(
    blockTags: CommentDisplayPart[],
    tag: string
  ): CommentDisplayPart[];

  /**
   * Filters block tags excluding specific tags.
   *
   * @param blockTags - The list of block tags.
   * @param tags - The tags to exclude.
   * @returns The filtered list of comment display parts.
   */
  filterBlockTagsNot(
    blockTags: CommentDisplayPart[],
    tags: string[] | string
  ): CommentDisplayPart[];

  /**
   * Retrieves comments for a class item.
   *
   * @param classItem - The class item reflection.
   * @returns An object containing summary and block tags.
   */
  getComments(classItem: DeclarationReflection): {
    summary: CommentDisplayPart[];
    blockTags: CommentDisplayPart[];
  };
}

/**
 * Utility functions for various operations.
 *
 * @remarks
 * This class provides static utility methods for common operations.
 *
 * @example
 * ```typescript
 * const commonPath = Utils.getCommonPath('/path/to/full', '/path/to');
 * ```
 */
declare class Utils {
  /**
   * Unescapes HTML entities in a string.
   *
   * @param text - The text containing HTML entities.
   * @returns The unescaped text.
   */
  static unescapeHtmlEntities(text: string): string;

  /**
   * Retrieves the common path between two paths.
   *
   * @param fullPath - The full path.
   * @param generatePath - The path to compare.
   * @returns The common path as a string.
   */
  static getCommonPath(fullPath: string, generatePath: string): string;

  /**
   * Extracts documentation paths from entry points and a full path.
   *
   * @param entryPoints - The entry points for the documentation.
   * @param generatePath - The path where documentation is generated.
   * @param fullPath - The full path to extract from.
   * @returns An object containing documentation paths.
   */
  static extractDocumentationPath(
    entryPoints: string[],
    generatePath: string,
    fullPath: string
  ): { docPath: string; docFullPath: string; docDir: string };
}
