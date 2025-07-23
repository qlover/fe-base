import { CommentDisplayPart, ReflectionKind } from 'typedoc';

/**
 * Utility type to extract value types from an object type
 *
 * This type helper extracts the value types from an object type T.
 * It's commonly used to get the union of all possible values in a const assertion.
 *
 * @template T - The object type to extract values from
 * @returns Union of all value types in the object
 *
 * @example
 * ```typescript
 * const Status = { ACTIVE: 'active', INACTIVE: 'inactive' } as const;
 * type StatusValue = ValueOf<typeof Status>; // 'active' | 'inactive'
 * ```
 */
export type ValueOf<T> = T[keyof T];

/**
 * Mapping of TypeDoc reflection kinds to string names
 *
 * This constant maps TypeDoc's numeric reflection kinds to human-readable
 * string names. This mapping is necessary because Handlebars templates
 * cannot properly handle numeric enum values, so we convert them to strings
 * for template processing.
 *
 * Core Concept:
 * TypeDoc uses numeric enums for reflection kinds, but template engines
 * like Handlebars work better with string values. This mapping provides
 * a bridge between TypeDoc's internal representation and template-friendly
 * string values.
 *
 * Usage:
 * - Template processing: Use string names for conditional logic
 * - Type safety: Provides type-safe access to reflection kind names
 * - Documentation generation: Human-readable kind names in output
 *
 * @example Basic Usage
 * ```typescript
 * const kindName = ReflectionKindName[ReflectionKind.Class]; // 'Class'
 * ```
 *
 * @example Template Usage
 * ```handlebars
 * {{#if (eq kindName "Class")}}
 * Class documentation
 * {{/if}}
 * ```
 *
 * @example Type Safety
 * ```typescript
 * function processKind(kind: ReflectionKind): string {
 *   return ReflectionKindName[kind];
 * }
 * ```
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

/**
 * Formatted project value representing a code element
 *
 * This interface represents a processed code element from TypeDoc reflection
 * data, formatted for template processing and markdown generation. It contains
 * all the essential information needed to generate comprehensive documentation
 * for classes, interfaces, functions, and other code elements.
 *
 * Core Structure:
 * - Basic identification: `id`, `name`, `kind`
 * - Type information: `typeString`, `kindName`
 * - Documentation: `descriptions` with JSDoc comments
 * - Source location: `source` for file and line information
 * - Hierarchical structure: `children` for nested elements
 * - Function-specific data: `parametersList` for method parameters
 *
 * @example Basic Structure
 * ```typescript
 * const classValue: FormatProjectValue = {
 *   id: 1,
 *   kind: ReflectionKind.Class,
 *   kindName: 'Class',
 *   name: 'UserService',
 *   typeString: 'class UserService',
 *   descriptions: [...],
 *   children: [...]
 * };
 * ```
 *
 * @example With Parameters
 * ```typescript
 * const methodValue: FormatProjectValue = {
 *   id: 2,
 *   kind: ReflectionKind.Method,
 *   kindName: 'Method',
 *   name: 'getUserById',
 *   typeString: '(id: string): Promise<User>',
 *   parametersList: [...],
 *   optional: false,
 *   since: '1.0.0'
 * };
 * ```
 */
export interface FormatProjectValue {
  /**
   * Unique identifier for the code element
   *
   * This ID is used internally for reference tracking and relationship
   * mapping between different code elements.
   *
   * @example `1`, `42`, `1001`
   */
  id: number;

  /**
   * TypeDoc reflection kind indicating the type of code element
   *
   * This field contains the original TypeDoc reflection kind enum value.
   * It's used for internal processing and can be converted to string
   * using `ReflectionKindName` for template usage.
   *
   * @example `ReflectionKind.Class`, `ReflectionKind.Interface`
   */
  kind: ReflectionKind;

  /**
   * Human-readable name for the reflection kind
   *
   * This is the string representation of the reflection kind, suitable
   * for template processing and documentation generation.
   *
   * @example `'Class'`, `'Interface'`, `'Method'`, `'Property'`
   */
  kindName: FormatProjectKindName;

  /**
   * Name of the code element
   *
   * This is the actual name of the class, interface, function, property,
   * or other code element as it appears in the source code.
   *
   * @example `'UserService'`, `'src/services/getUserById'`
   */
  name: string;

  /**
   * Type string representation
   *
   * This field contains the type information as a string, including
   * parameter types, return types, and generic type parameters.
   *
   * @example `'string'`, `'(id: string): Promise<User>'`, `'User[]'`
   */
  typeString: string;

  /**
   * Documentation descriptions from JSDoc comments
   *
   * This array contains all documentation content extracted from JSDoc
   * comments, including summary, parameter descriptions, return value
   * descriptions, and custom tags.
   *
   * @example
   * ```typescript
   * descriptions: [
   *   { tag: '@summary', content: [...] },
   *   { tag: '@param', name: 'id', content: [...] },
   *   { tag: '@returns', content: [...] }
   * ]
   * ```
   */
  descriptions: FormatProjectDescription[];

  /**
   * Source file information for the code element
   *
   * This optional field contains information about where the code element
   * is defined in the source code, including file name, line number, and
   * character position.
   *
   * @example
   * ```typescript
   * source: {
   *   fileName: 'src/services/UserService.ts',
   *   line: 15,
   *   character: 10,
   *   url: 'https://github.com/user/repo/blob/main/src/services/UserService.ts#L15'
   * }
   * ```
   */
  source?: FormatProjectSource;

  /**
   * List of parameters for functions, methods, and constructors
   *
   * This field contains detailed information about each parameter,
   * including name, type, description, default value, and metadata
   * like deprecation status and version information.
   *
   * Required fields when present:
   * - Parameter name and type
   * - Parameter description
   * - Default value (if any)
   * - Deprecation status
   * - Version information (`@since` tag)
   *
   * @example
   * ```typescript
   * parametersList: [
   *   {
   *     id: 3,
   *     kind: ReflectionKind.Parameter,
   *     kindName: 'Parameter',
   *     name: 'userId',
   *     typeString: 'string',
   *     descriptions: [...],
   *     optional: false,
   *     since: '1.0.0'
   *   }
   * ]
   * ```
   */
  parametersList?: FormatProjectValue[];

  /**
   * Child elements of the current code element
   *
   * This field contains nested code elements that belong to the current
   * element. The structure varies based on the parent element type:
   *
   * - Classes and Interfaces: Members (properties, methods, constructors)
   * - Type Aliases: Union/intersection members
   * - Enums: Enum members (treated as properties)
   * - Functions: Signatures and overloads
   *
   * @example
   * ```typescript
   * children: [
   *   // Class properties and methods
   *   { kindName: 'Property', name: 'name', ... },
   *   { kindName: 'Method', name: 'getName', ... }
   * ]
   * ```
   */
  children?: FormatProjectValue[];

  /**
   * Default value for parameters or properties
   *
   * This field is required when `parametersList` is present and contains
   * the default value as a string representation.
   *
   * @example `'default'`, `'0'`, `'true'`, `'[]'`
   */
  defaultValue?: string;

  /**
   * Version when the element was introduced
   *
   * This field contains the version information from the `@since` JSDoc tag,
   * indicating when the code element was first introduced in the API.
   *
   * @example `'1.0.0'`, `'2.1.0'`, `'3.0.0-beta.1'`
   */
  since?: string;

  /**
   * Whether the element is deprecated
   *
   * This field indicates if the code element has been marked as deprecated
   * using the `@deprecated` JSDoc tag.
   *
   * @default `false`
   */
  deprecated?: boolean;

  /**
   * Whether the parameter or property is optional
   *
   * This field indicates if a parameter or property is optional, either
   * through TypeScript's `?` syntax or the `@optional` JSDoc tag.
   *
   * @default `false`
   */
  optional?: boolean;
}

/**
 * Type alias for reflection kind names
 *
 * This type represents the union of all possible reflection kind names
 * from the `ReflectionKindName` constant. It provides type safety when
 * working with reflection kind names in templates and processing logic.
 *
 * @example
 * ```typescript
 * function processKind(kindName: FormatProjectKindName): string {
 *   switch (kindName) {
 *     case 'Class': return 'Class documentation';
 *     case 'Interface': return 'Interface documentation';
 *     default: return 'Other documentation';
 *   }
 * }
 * ```
 */
export type FormatProjectKindName =
  (typeof ReflectionKindName)[keyof typeof ReflectionKindName];

/**
 * Formatted description from JSDoc comments
 *
 * This interface represents a single documentation description extracted
 * from JSDoc comments. It can represent summary content, parameter
 * descriptions, return value descriptions, or custom tag content.
 *
 * Structure:
 * - `tag`: Identifies the type of description (e.g., `@summary`, `@param`)
 * - `name`: Optional name for tagged descriptions (e.g., parameter name)
 * - `content`: Array of comment display parts containing the actual text
 *
 * @example Summary Description
 * ```typescript
 * {
 *   tag: '@summary',
 *   content: [{ kind: 'text', text: 'User authentication service' }]
 * }
 * ```
 *
 * @example Parameter Description
 * ```typescript
 * {
 *   tag: '@param',
 *   name: 'userId',
 *   content: [{ kind: 'text', text: 'Unique user identifier' }]
 * }
 * ```
 */
export interface FormatProjectDescription {
  /**
   * JSDoc tag identifier for the description
   *
   * This field identifies the type of description content, such as
   * `@summary`, `@param`, `@returns`, `@example`, or custom tags.
   *
   * @example `'@summary'`, `'@param'`, `'@returns'`, `'@since'`
   */
  tag: string;

  /**
   * Optional name for tagged descriptions
   *
   * This field is used for descriptions that are associated with a
   * specific name, such as parameter descriptions where the name
   * identifies which parameter the description belongs to.
   *
   * @example `'userId'`
   */
  name?: string;

  /**
   * Content parts of the description
   *
   * This array contains the actual text content of the description,
   * broken down into display parts that may include plain text,
   * code references, links, and other formatted content.
   *
   * @example
   * ```typescript
   * content: [
   *   { kind: 'text', text: 'User identifier in ' },
   *   { kind: 'code', text: 'string' },
   *   { kind: 'text', text: ' format' }
   * ]
   * ```
   */
  content: CommentDisplayPart[];
}

/**
 * Source file information for code elements
 *
 * This interface contains information about the location of a code element
 * in the source code, including file name, line number, character position,
 * and optional URL for source code linking.
 *
 * Usage:
 * - Documentation generation: Link to source code
 * - Debugging: Identify element locations
 * - IDE integration: Provide navigation capabilities
 *
 * @example Basic Source Information
 * ```typescript
 * {
 *   fileName: 'src/services/UserService.ts',
 *   line: 15,
 *   character: 10
 * }
 * ```
 *
 * @example With Source URL
 * ```typescript
 * {
 *   fileName: 'src/utils/helpers.ts',
 *   line: 42,
 *   character: 5,
 *   url: 'https://github.com/user/repo/blob/main/src/utils/helpers.ts#L42'
 * }
 * ```
 */
export interface FormatProjectSource {
  /**
   * Name of the source file
   *
   * This field contains the file name where the code element is defined,
   * typically including the relative path from the project root.
   *
   * @example `'src/services/UserService.ts'`, `'packages/core/index.ts'`
   */
  fileName: string;

  /**
   * Line number in the source file
   *
   * This field indicates the line number where the code element begins
   * in the source file, starting from 1.
   *
   * @example `1`, `15`, `42`, `100`
   */
  line: number;

  /**
   * Character position on the line
   *
   * This field indicates the character position within the line where
   * the code element begins, starting from 0.
   *
   * @example `0`, `5`, `10`, `20`
   */
  character: number;

  /**
   * Optional URL for source code linking
   *
   * This field contains a URL that can be used to link directly to
   * the source code location, typically for GitHub, GitLab, or other
   * version control system integration.
   *
   * @example `'https://github.com/user/repo/blob/main/src/file.ts#L15'`
   */
  url?: string;
}
