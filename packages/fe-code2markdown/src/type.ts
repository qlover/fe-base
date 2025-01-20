import {
  CommentDisplayPart,
  ParameterReflection,
  ReflectionKind,
  SourceReference
} from 'typedoc';
import { FeScriptContext } from '@qlover/scripts-context';

type ValueOf<T> = T[keyof T];
/**
 * FIXME: hbs无法识别 kind 数字类型, 手动转成字符串
 */
export const ReflectionKindName = {
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
  type: string | undefined;
  kindName: string;
  summaryList: CommentDisplayPart[];
  blockTagsList: CommentDisplayPart[];
  parametersList: ParameterReflection[] | undefined;
  descriptionList: CommentDisplayPart[];
  returnValue: string | undefined;
  source: SourceReference;
  members: object[];
  hasMembers: boolean;
};

export type ReflectionGeneraterOptions = {
  entryPoints: string[];
  outputJSONFilePath: string;
  generatePath: string;
  /**
   * typedoc parse base path
   */
  basePath?: string;
  tplPath: string;

  /**
   * hbs template root dir
   */
  hbsRootDir: string;
};

export type ReflectionGeneraterContext =
  FeScriptContext<ReflectionGeneraterOptions>;
