import { ReflectionKind } from 'typedoc';

export type ValueOf<T> = T[keyof T];
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
