/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Application,
  ParameterReflection,
  ProjectReflection,
  ReflectionKind,
  TSConfigReader,
  TypeDocOptions,
  TypeDocReader
} from 'typedoc';
import { ScriptPlugin, ScriptPluginProps } from '@qlover/scripts-context';
import {
  FormatProjectDescription,
  FormatProjectSource,
  FormatProjectValue,
  ReflectionKindName
} from '../type';
import fsExtra from 'fs-extra';
import { resolve } from 'path';
import Code2MDContext from '../implments/Code2MDContext';

/**
 * Configuration options for the TypeDocs plugin
 */
export interface TypeDocsProps extends ScriptPluginProps {
  /**
   * Output JSON file path for TypeDoc project data
   *
   * When specified, the plugin will write the raw TypeDoc project data
   * to this file for debugging or external processing purposes.
   */
  outputJSONFilePath?: string;

  /**
   * Base path for TypeDoc parsing operations
   *
   * This path is used as the root directory for TypeDoc to resolve
   * relative imports and file references. Should match the project root.
   *
   * @default `process.cwd()`
   */
  basePath?: string;

  /**
   * Handlebars template data file path
   *
   * When specified, the plugin will write the formatted project data
   * to this file for use with Handlebars templates in the formats plugin.
   *
   * @default `./docs.output/code2md.tpl.json`
   */
  tplPath?: string;

  /**
   * JSDoc tags to filter out from descriptions
   *
   * These tags will be excluded from the formatted descriptions
   * as they are handled separately (e.g., `@default`, `@since`, `@deprecated`).
   * This prevents duplicate information in the generated documentation.
   *
   * @default `["@default", "@since", "@deprecated", "@optional"]`
   */
  filterTags?: string[];
}

const SEPARATORS_UNION = ' \\| ';
const SEPARATORS_INTERSECTION = ' & ';
const SEPARATORS_PARAMS = ', ';

/**
 * TypeDocs plugin for parsing TypeScript code and generating structured documentation data
 *
 * Core Responsibilities:
 * - Parse TypeScript source files using TypeDoc library
 * - Convert TypeDoc reflection objects to standardized format
 * - Extract JSDoc comments, types, and metadata
 * - Generate JSON output for debugging and template processing
 * - Handle complex TypeScript types and nested structures
 * - Process function signatures, parameters, and return types
 *
 * Design Considerations:
 * - Uses TypeDoc for accurate TypeScript parsing and reflection
 * - Converts complex reflection objects to simplified format
 * - Handles nested object types and union/intersection types
 * - Filters JSDoc tags to prevent information duplication
 * - Supports both raw JSON output and template data generation
 * - Maintains source file information for debugging
 *
 * @example Basic Usage
 * ```typescript
 * const typeDocs = new TypeDocJson(context);
 * await typeDocs.onBefore(); // Parse TypeScript files
 * ```
 *
 * @example With Configuration
 * ```typescript
 * const typeDocs = new TypeDocJson(context);
 * typeDocs.setConfig({
 *   outputJSONFilePath: './debug/typedoc.json',
 *   filterTags: ['@internal', '@private']
 * });
 * await typeDocs.onBefore();
 * ```
 */
export default class TypeDocJson extends ScriptPlugin<
  Code2MDContext,
  TypeDocsProps
> {
  /**
   * Initialize the TypeDocs plugin
   *
   * @param context - Code2MD context containing source file information
   */
  constructor(context: Code2MDContext) {
    super(context, 'typeDocs');
  }

  /**
   * Main execution method that parses TypeScript files and generates documentation data
   *
   * Implementation Details:
   * 1. Extracts entry points from reader outputs
   * 2. Initializes TypeDoc application with project configuration
   * 3. Converts TypeScript files to reflection objects
   * 4. Optionally writes raw TypeDoc JSON for debugging
   * 5. Converts reflection objects to standardized format
   * 6. Optionally writes template data for Handlebars processing
   * 7. Stores formatted project data in context for downstream plugins
   *
   * Business Rules:
   * - Uses reader outputs as entry points for TypeDoc processing
   * - Excludes private members but includes protected and external members
   * - Skips error checking for faster processing
   * - Includes version information in reflection objects
   * - Generates both raw and formatted output based on configuration
   * - Preserves source file information for debugging
   *
   * @throws {Error} When TypeDoc project conversion fails
   * @throws {Error} When file writing operations fail
   *
   * @example
   * ```typescript
   * await typeDocs.onBefore();
   * // Parses all TypeScript files and generates documentation data
   * ```
   */
  override async onBefore(): Promise<void> {
    const entryPoints = this.context.options.readerOutputs!.map(
      (output) => output.relativePath
    );

    const [project, app] = await this.getTypeDocsProject({
      basePath: resolve(this.getConfig('basePath', process.cwd())),
      entryPoints: entryPoints,
      skipErrorChecking: true,
      includeVersion: true,
      excludePrivate: true,
      excludeProtected: false,
      excludeExternals: false
    });

    const outputPath = this.getConfig('outputJSONFilePath', '');
    if (outputPath) {
      this.writeJSON(app.serializer.projectToObject(project, './'), outputPath);
    }

    const formatProject = this.formats(project);

    const tplPath = this.getConfig('tplPath', '');
    if (tplPath) {
      this.writeJSON(formatProject, tplPath);
    }

    this.context.setOptions({ formatProject });
  }

  /**
   * Initialize TypeDoc application and convert TypeScript files to reflection objects
   *
   * Implementation Details:
   * 1. Bootstraps TypeDoc application with provided options
   * 2. Configures TSConfig and TypeDoc readers for project parsing
   * 3. Converts TypeScript files to reflection objects
   * 4. Validates conversion success and returns project data
   *
   * Business Rules:
   * - Uses TSConfigReader for TypeScript configuration parsing
   * - Uses TypeDocReader for TypeDoc-specific configuration
   * - Throws error if project conversion fails
   * - Returns both project reflection and application instance
   * - Supports partial TypeDoc options for flexible configuration
   *
   * @param options - TypeDoc configuration options
   * @returns Promise resolving to [ProjectReflection, Application] tuple
   *
   * @throws {Error} When TypeDoc application bootstrap fails
   * @throws {Error} When project conversion fails
   *
   * @example
   * ```typescript
   * const [project, app] = await typeDocs.getTypeDocsProject({
   *   entryPoints: ['src/index.ts'],
   *   excludePrivate: true
   * });
   * ```
   */
  async getTypeDocsProject(
    options: Partial<TypeDocOptions>
  ): Promise<[ProjectReflection, Application]> {
    const app = await Application.bootstrap(options, [
      new TSConfigReader(),
      new TypeDocReader()
    ]);

    const project = await app.convert();

    if (!project) {
      throw new Error('Failed to convert project');
    }

    return [project, app];
  }

  /**
   * Write data to JSON file with proper formatting
   *
   * Implementation Details:
   * 1. Validates that output path is provided
   * 2. Removes existing file if it exists
   * 3. Ensures parent directory structure exists
   * 4. Serializes data to JSON with 2-space indentation
   * 5. Writes formatted JSON to file with UTF-8 encoding
   *
   * Business Rules:
   * - Skips writing if path is empty or invalid
   * - Overwrites existing files without warning
   * - Creates parent directories as needed
   * - Uses consistent JSON formatting for readability
   * - Logs warning for empty paths
   *
   * @param value - Data to serialize and write
   * @param path - Output file path
   *
   * @throws {Error} When file system operations fail
   *
   * @example
   * ```typescript
   * this.writeJSON(data, '/path/to/output.json');
   * ```
   *
   * @example Error Handling
   * ```typescript
   * try {
   *   this.writeJSON(projectData, './output.json');
   * } catch (error) {
   *   // Handle file system errors
   *   console.error('Failed to write JSON:', error.message);
   * }
   * ```
   */
  writeJSON(value: unknown, path: string): void {
    if (!path) {
      this.logger.warn('ProjectReader writeJSON Output path is empty!');
      return;
    }

    fsExtra.removeSync(path);
    fsExtra.ensureFileSync(path);
    fsExtra.writeFileSync(path, JSON.stringify(value, null, 2), 'utf-8');
  }

  /**
   * Convert TypeDoc ProjectReflection to standardized FormatProjectValue array
   *
   * Implementation Details:
   * 1. Validates that project has children elements
   * 2. Filters out reflections from .d.ts declaration files
   * 3. Maps remaining reflections to standardized format
   * 4. Uses convertReflectionToFormatValue for individual conversion
   * 5. Returns empty array if no children exist
   *
   * Business Rules:
   * - Returns empty array for projects without children
   * - Excludes all reflections from .d.ts declaration files
   * - Processes all remaining top-level reflections in project
   * - Maintains original order of non-filtered reflections
   * - Handles null/undefined children gracefully
   * - Delegates complex conversion to specialized method
   * - Preserves reflections without source information
   *
   * Filtering Rules:
   * - Checks source file information for each reflection
   * - Excludes reflections from files ending with .d.ts
   * - Keeps reflections without source information (returns true)
   * - Applies filtering before format conversion for better performance
   *
   * @param project - TypeDoc project reflection object
   * @returns Array of standardized FormatProjectValue objects, excluding .d.ts content
   *
   * @example
   * ```typescript
   * const formatData = this.formats(project);
   * // Returns: [{ id: 1, kind: 1, name: 'UserService', ... }, ...]
   * // Note: Excludes any content from .d.ts files
   * ```
   *
   * @example Empty Project
   * ```typescript
   * const formatData = this.formats(emptyProject);
   * // Returns: []
   * ```
   */
  formats(project: ProjectReflection): FormatProjectValue[] {
    if (!project.children) {
      return [];
    }

    return project.children
      .filter((child) => {
        const source = this.getSourceInfo(child);
        // Filter out .d.ts files
        if (source && source.fileName.endsWith('.d.ts')) {
          return false;
        }
        // Filter out index.ts files without comments
        if (source && source.fileName.endsWith('index.ts') && !child.comment) {
          return false;
        }
        return true;
      })
      .map((child) => {
        const source = this.getSourceInfo(child);
        const isIndexFile = source?.fileName.endsWith('index.ts');
        // Convert the reflection to format value
        const formatValue = this.convertReflectionToFormatValue(child);
        // Remove children for index.ts files
        if (isIndexFile) {
          delete formatValue.children;
          delete formatValue.parametersList;
        }
        return formatValue;
      });
  }

  /**
   * Convert individual TypeDoc reflection to standardized FormatProjectValue
   *
   * Implementation Details:
   * 1. Extracts reflection kind and maps to readable name
   * 2. Generates type string representation for the reflection
   * 3. Formats JSDoc comments and descriptions
   * 4. Extracts source file information
   * 5. Processes function parameters and signatures
   * 6. Handles nested children and type declarations
   * 7. Extracts metadata (default value, since, deprecated, optional)
   *
   * Business Rules:
   * - Maps reflection kinds to human-readable names
   * - Handles complex TypeScript types (union, intersection, reflection)
   * - Processes function signatures with parameters and return types
   * - Flattens nested object types for better documentation
   * - Filters JSDoc tags to prevent information duplication
   * - Preserves source file information for debugging
   * - Handles constructor signatures specially
   *
   * Type Processing:
   * - Intrinsic types: string, number, boolean, etc.
   * - Reference types: class names, interface names
   * - Literal types: string literals, number literals
   * - Union types: string | number | boolean
   * - Intersection types: A & B & C
   * - Reflection types: object types with properties
   *
   * @param reflection - TypeDoc reflection object to convert
   * @returns Standardized FormatProjectValue object
   *
   * @example
   * ```typescript
   * const formatValue = this.convertReflectionToFormatValue(classReflection);
   * // Returns: { id: 1, kind: 1, kindName: 'Class', name: 'UserService', ... }
   * ```
   *
   * @example Function with Parameters
   * ```typescript
   * const formatValue = this.convertReflectionToFormatValue(functionReflection);
   * // Returns: { name: 'login', parametersList: [...], typeString: '(user: User) => Promise<AuthResult>' }
   * ```
   */
  private convertReflectionToFormatValue(reflection: any): FormatProjectValue {
    const kindName =
      ReflectionKindName[reflection.kind as keyof typeof ReflectionKindName] ||
      'Unknown';

    // 获取类型字符串
    const typeString = this.getTypeString(reflection);

    // 格式化描述信息
    const descriptions = this.formatDescription(reflection.comment);

    // 获取源文件信息
    const source = this.getSourceInfo(reflection);

    // 处理参数列表
    let parametersList: FormatProjectValue[] | undefined;
    if (reflection.signatures?.[0]?.parameters) {
      parametersList = this.formatParameters(
        reflection.signatures[0].parameters
      );
    } else if (reflection.parameters) {
      parametersList = this.formatParameters(reflection.parameters);
    }

    // 处理子元素
    let children: FormatProjectValue[] | undefined;
    if (reflection.children) {
      children = reflection.children.map((child: any) =>
        this.convertReflectionToFormatValue(child)
      );
    }

    // 处理 type.declaration.children（用于 type 类型）
    if (
      reflection.type?.type === 'reflection' &&
      reflection.type.declaration?.children
    ) {
      const typeChildren = reflection.type.declaration.children.map(
        (child: any) => this.convertReflectionToFormatValue(child)
      );
      children = children ? [...children, ...typeChildren] : typeChildren;
    }

    // 处理签名作为子元素
    // 对于构造函数，将签名信息直接包含在构造函数对象中，不作为子元素
    if (reflection.signatures && reflection.signatures.length > 0) {
      if (reflection.kind === ReflectionKind.Constructor) {
        // 对于构造函数，将第一个签名的参数信息直接包含在构造函数中
        const firstSignature = reflection.signatures[0];
        if (firstSignature.parameters) {
          parametersList = this.formatParameters(firstSignature.parameters);
        }
        // 修改构造函数的名称，使其包含类名
        if (firstSignature.name && firstSignature.name.startsWith('new ')) {
          reflection.name = firstSignature.name;
        }
      } else {
        // 对于其他类型，将签名作为子元素
        const signatureChildren = reflection.signatures.map((signature: any) =>
          this.convertReflectionToFormatValue(signature)
        );
        children = children
          ? [...children, ...signatureChildren]
          : signatureChildren;
      }
    }

    // 获取额外属性
    const defaultValue = this.getDefaultValue(reflection);
    const since = this.getSinceVersion(reflection);
    const deprecated = this.isDeprecated(reflection);
    const optional = this.isOptional(reflection);

    return {
      id: reflection.id,
      kind: reflection.kind,
      kindName: kindName as any,
      name: reflection.name,
      typeString,
      descriptions,
      source,
      parametersList,
      children,
      defaultValue,
      since,
      deprecated,
      optional
    };
  }

  /**
   * Extract and format type information as a readable string
   *
   * Implementation Details:
   * 1. Checks if reflection has type information
   * 2. Handles different type categories (intrinsic, reference, literal, etc.)
   * 3. Processes complex types (union, intersection, reflection)
   * 4. Generates function signatures with parameters and return types
   * 5. Falls back to 'unknown' for unrecognized types
   *
   * Business Rules:
   * - Intrinsic types: returns type name directly (string, number, boolean)
   * - Reference types: returns type name or 'Reference' fallback
   * - Literal types: wraps string values in quotes, converts others to string
   * - Union types: joins with ' | ' separator
   * - Intersection types: joins with ' & ' separator
   * - Reflection types: returns 'Object' for object types
   * - Function types: generates parameter list and return type
   * - Unknown types: returns 'unknown' fallback
   *
   * Type Categories:
   * - Intrinsic: string, number, boolean, any, void, etc.
   * - Reference: class names, interface names, type aliases
   * - Literal: "hello", 42, true, etc.
   * - Union: string | number | boolean
   * - Intersection: A & B & C
   * - Reflection: object types with properties
   * - Function: (param: type) => returnType
   *
   * @param reflection - TypeDoc reflection object
   * @returns Formatted type string representation
   *
   * @example
   * ```typescript
   * this.getTypeString({ type: { type: 'intrinsic', name: 'string' } });
   * // Returns: 'string'
   * ```
   *
   * @example Complex Types
   * ```typescript
   * this.getTypeString({ type: { type: 'union', types: [...] } });
   * // Returns: 'string | number | boolean'
   * ```
   */
  private getTypeString(reflection: any): string {
    if (reflection.type) {
      if (reflection.type.type === 'intrinsic') {
        return reflection.type.name;
      }
      if (reflection.type.type === 'reference') {
        // 对于引用类型，返回完整的类型名称
        let typeName = reflection.type.name || 'Reference';

        // 处理泛型类型参数
        if (
          reflection.type.typeArguments &&
          reflection.type.typeArguments.length > 0
        ) {
          const typeArgs = reflection.type.typeArguments
            .map((arg: any) => this.getTypeString({ type: arg }))
            .join(SEPARATORS_PARAMS);
          typeName += `<${typeArgs}>`;
        }

        return typeName;
      }
      if (reflection.type.type === 'literal') {
        return typeof reflection.type.value === 'string'
          ? `"${reflection.type.value}"`
          : String(reflection.type.value);
      }
      if (reflection.type.type === 'reflection') {
        return 'Object';
      }
      if (reflection.type.type === 'array') {
        const elementType = this.getTypeString({
          type: reflection.type.elementType
        });
        return `${elementType}[]`;
      }
      if (reflection.type.type === 'union') {
        const unionTypes = reflection.type.types
          ?.map((t: any) => this.getTypeString({ type: t }))
          .filter(Boolean);
        return unionTypes.length > 0
          ? unionTypes.join(SEPARATORS_UNION)
          : 'Union';
      }
      if (reflection.type.type === 'intersection') {
        return (
          reflection.type.types
            ?.map((t: any) => this.getTypeString({ type: t }))
            .join(SEPARATORS_INTERSECTION) || 'Intersection'
        );
      }
    }

    // 对于方法/函数，返回函数签名
    if (reflection.signatures?.[0]) {
      const signature = reflection.signatures[0];
      const params =
        signature.parameters
          ?.map((p: any) => `${p.name}: ${this.getTypeString(p)}`)
          .join(SEPARATORS_PARAMS) || '';
      const returnType = this.getTypeString(signature);
      return `(${params}) => ${returnType}`;
    }

    return 'unknown';
  }

  /**
   * Extract default value from reflection object
   *
   * Implementation Details:
   * 1. Checks reflection.defaultValue property first
   * 2. Handles TypeDoc's ellipsis ("...") for complex default values
   * 3. Infers reasonable default values based on parameter type when ellipsis is encountered
   * 4. Searches for `@default` JSDoc tag in comment block tags
   * 5. Extracts text content from `@default` tag
   * 6. Removes backticks from default value for clean formatting
   * 7. Returns undefined if no default value found
   *
   * Business Rules:
   * - Prioritizes reflection.defaultValue over JSDoc `@default` tag
   * - When defaultValue is "..." (TypeDoc's ellipsis for complex expressions):
   *   - For object/reflection types: returns "{}"
   *   - For array types: returns "[]"
   *   - For other types: returns undefined
   * - Converts default value to string representation
   * - Removes markdown backticks from JSDoc default values
   * - Returns undefined for missing default values
   * - Handles both primitive and object default values
   *
   * @param reflection - TypeDoc reflection object
   * @returns Default value as string, or undefined if not found
   *
   * @example
   * ```typescript
   * this.getDefaultValue({ defaultValue: 'hello' });
   * // Returns: 'hello'
   * ```
   *
   * @example TypeDoc Ellipsis Handling
   * ```typescript
   * this.getDefaultValue({
   *   defaultValue: '...',
   *   type: { type: 'reflection' }
   * });
   * // Returns: '{}'
   * ```
   *
   * @example JSDoc Default Tag
   * ```typescript
   * this.getDefaultValue({
   *   comment: {
   *     blockTags: [{ tag: '@default', content: [{ text: '`42`' }] }]
   *   }
   * });
   * // Returns: '42'
   * ```
   */
  private getDefaultValue(reflection: any): string | undefined {
    if (reflection.defaultValue !== undefined) {
      const defaultValueStr = String(reflection.defaultValue);

      // Handle TypeDoc's ellipsis ("...") for complex default value expressions
      // TypeDoc uses "..." when it cannot fully parse complex expressions like "{} as Opt"
      if (defaultValueStr === '...') {
        // Try to infer a reasonable default value based on the parameter type
        if (reflection.type) {
          // For object/reflection types, infer "{}"
          if (reflection.type.type === 'reflection') {
            return '{}';
          }
          // For array types, infer "[]"
          if (reflection.type.type === 'array') {
            return '[]';
          }
          // For reference types that might be objects, check if it's likely an object type
          // This is a heuristic - we can't be 100% sure, but "{}" is a common default for object types
          if (reflection.type.type === 'reference') {
            // Common object-like type names (case-insensitive check)
            const typeName = reflection.type.name?.toLowerCase() || '';
            // If it's clearly not a primitive or function, assume it might be an object
            const primitiveTypes = [
              'string',
              'number',
              'boolean',
              'null',
              'undefined',
              'void',
              'any',
              'unknown'
            ];
            if (!primitiveTypes.includes(typeName)) {
              // For generic or complex types, we'll return "{}" as a reasonable default
              // This handles cases like "Opt", "Options", "Config", etc.
              return '{}';
            }
          }
        }
        // If we can't infer, return undefined to let JSDoc @default tag take precedence
        return undefined;
      }

      return defaultValueStr;
    }

    // 从注释中获取 @default 标签
    if (reflection.comment?.blockTags) {
      const defaultTag = reflection.comment.blockTags.find(
        (tag: any) => tag.tag === '@default'
      );
      if (defaultTag?.content?.[0]?.text) {
        return defaultTag.content[0].text.replace(/`/g, '');
      }
    }

    return undefined;
  }

  /**
   * Extract `@since` version information from reflection object
   *
   * Implementation Details:
   * 1. Searches for `@since` JSDoc tag in comment block tags
   * 2. Extracts text content from the first `@since` tag found
   * 3. Returns undefined if no `@since` tag exists
   * 4. Handles multiple `@since` tags by using the first one
   *
   * Business Rules:
   * - Only processes `@since` tags from JSDoc comments
   * - Returns the first `@since` tag found (ignores duplicates)
   * - Returns undefined for missing `@since` tags
   * - Preserves original text content without modification
   * - Handles empty or malformed `@since` tags gracefully
   *
   * @param reflection - TypeDoc reflection object
   * @returns Version string from `@since` tag, or undefined if not found
   *
   * @example
   * ```typescript
   * this.getSinceVersion({
   *   comment: {
   *     blockTags: [{ tag: '@since', content: [{ text: '1.2.0' }] }]
   *   }
   * });
   * // Returns: '1.2.0'
   * ```
   */
  private getSinceVersion(reflection: any): string | undefined {
    if (reflection.comment?.blockTags) {
      const sinceTag = reflection.comment.blockTags.find(
        (tag: any) => tag.tag === '@since'
      );
      if (sinceTag?.content?.[0]?.text) {
        return sinceTag.content[0].text;
      }
    }
    return undefined;
  }

  /**
   * Check if reflection is marked as deprecated
   *
   * Implementation Details:
   * 1. Searches for `@deprecated` JSDoc tag in comment block tags
   * 2. Returns true if `@deprecated` tag is found
   * 3. Returns false if no `@deprecated` tag exists
   * 4. Ignores `@deprecated` tag content (only checks presence)
   *
   * Business Rules:
   * - Only checks for `@deprecated` tags in JSDoc comments
   * - Returns boolean true/false based on tag presence
   * - Ignores `@deprecated` tag content and parameters
   * - Handles multiple `@deprecated` tags (any presence = true)
   * - Returns false for reflections without comments
   *
   * @param reflection - TypeDoc reflection object
   * @returns True if `@deprecated` tag is present, false otherwise
   *
   * @example
   * ```typescript
   * this.isDeprecated({
   *   comment: {
   *     blockTags: [{ tag: '@deprecated' }]
   *   }
   * });
   * // Returns: true
   * ```
   *
   * @example Not Deprecated
   * ```typescript
   * this.isDeprecated({ comment: { blockTags: [] } });
   * // Returns: false
   * ```
   */
  private isDeprecated(reflection: any): boolean {
    if (reflection.comment?.blockTags) {
      return reflection.comment.blockTags.some(
        (tag: any) => tag.tag === '@deprecated'
      );
    }
    return false;
  }

  /**
   * Check if reflection represents an optional parameter or property
   *
   * Implementation Details:
   * 1. Checks reflection.flags.isOptional for TypeScript optional syntax (`?`)
   * 2. Checks reflection.defaultValue for default value presence
   * 3. Searches for `@default` JSDoc tag in comment block tags
   * 4. Searches for `@optional` JSDoc tag in comment block tags
   * 5. Returns true if any optional indicator is found
   *
   * Business Rules:
   * - TypeScript optional syntax (`?`) takes highest priority
   * - Default values indicate optional parameters
   * - `@default` JSDoc tag indicates optional parameters
   * - `@optional` JSDoc tag explicitly marks as optional
   * - Returns true if any optional indicator is present
   * - Returns false only if no optional indicators found
   *
   * Optional Indicators:
   * - reflection.flags.isOptional: TypeScript `?` syntax
   * - reflection.defaultValue: Default value assigned
   * - `@default` JSDoc tag: Default value documented
   * - `@optional` JSDoc tag: Explicitly marked optional
   *
   * @param reflection - TypeDoc reflection object
   * @returns True if parameter/property is optional, false otherwise
   *
   * @example TypeScript Optional Syntax
   * ```typescript
   * this.isOptional({ flags: { isOptional: true } });
   * // Returns: true
   * ```
   *
   * @example Default Value
   * ```typescript
   * this.isOptional({ defaultValue: 'hello' });
   * // Returns: true
   * ```
   *
   * @example JSDoc Tags
   * ```typescript
   * this.isOptional({
   *   comment: {
   *     blockTags: [{ tag: '@optional' }]
   *   }
   * });
   * // Returns: true
   * ```
   */
  private isOptional(reflection: any): boolean {
    // 检查是否有 ? 标记（可选参数）
    if (reflection.flags?.isOptional) {
      return true;
    }

    // 检查是否有默认值
    if (reflection.defaultValue !== undefined) {
      return true;
    }

    // 检查 @default 标签
    if (reflection.comment?.blockTags) {
      const hasDefaultTag = reflection.comment.blockTags.some(
        (tag: any) => tag.tag === '@default'
      );
      if (hasDefaultTag) {
        return true;
      }
    }

    // 检查 @optional 标签
    if (reflection.comment?.blockTags) {
      const hasOptionalTag = reflection.comment.blockTags.some(
        (tag: any) => tag.tag === '@optional'
      );
      if (hasOptionalTag) {
        return true;
      }
    }

    return false;
  }

  /**
   * Format TypeDoc comments into standardized description format
   *
   * Implementation Details:
   * 1. Processes comment.summary for main description
   * 2. Filters out specified JSDoc tags to prevent duplication
   * 3. Sorts remaining tags by priority (summary/description first)
   * 4. Converts each tag to FormatProjectDescription format
   * 5. Returns array of formatted descriptions
   *
   * Business Rules:
   * - Summary content is always included as `@summary` tag
   * - Filters out tags specified in filterTags configuration
   * - Prioritizes `@summary` and `@description` tags
   * - Preserves original tag order for non-priority tags
   * - Handles missing or empty comments gracefully
   * - Maintains tag names and content structure
   *
   * Filtered Tags (default):
   * - `@default`: Handled separately by getDefaultValue
   * - `@since`: Handled separately by getSinceVersion
   * - `@deprecated`: Handled separately by isDeprecated
   * - `@optional`: Handled separately by isOptional
   *
   * Priority Tags:
   * - `@summary`: Always displayed first
   * - `@description`: Displayed after summary
   * - Other tags: Displayed in original order
   *
   * @param comment - TypeDoc comment object
   * @returns Array of formatted description objects
   *
   * @example
   * ```typescript
   * const descriptions = this.formatDescription(reflection.comment);
   * // Returns: [{ tag: '@summary', content: [...] }, { tag: '@param', name: 'user', content: [...] }]
   * ```
   *
   * @example With Filtered Tags
   * ```typescript
   * // `@default`, `@since`, `@deprecated`, `@optional` are filtered out
   * const descriptions = this.formatDescription(comment);
   * // Only returns non-filtered tags like `@param`, `@returns`, `@example`
   * ```
   */
  formatDescription(comment: any): FormatProjectDescription[] {
    if (!comment) {
      return [];
    }

    const descriptions: FormatProjectDescription[] = [];

    const filterTags = this.getConfig('filterTags') as string[] | undefined;
    // Dynamic get tags to filter out (priority context configuration)
    const filteredTags = filterTags || [
      '@default',
      '@since',
      '@deprecated',
      '@optional'
    ];
    // Define tags to display first
    const priorityTags = ['@summary', '@description'];

    // Process summary
    if (comment.summary && comment.summary.length > 0) {
      descriptions.push({
        tag: '@summary',
        content: comment.summary
      });
    }

    // Process blockTags, filter out tags that have been extracted separately
    if (comment.blockTags && comment.blockTags.length > 0) {
      const validTags = comment.blockTags.filter(
        (tag: any) => !filteredTags.includes(tag.tag)
      );

      // Sort by priority: priority tags first, others in original order
      const sortedTags = validTags.sort((a: any, b: any) => {
        const aPriority = priorityTags.includes(a.tag);
        const bPriority = priorityTags.includes(b.tag);
        if (aPriority && !bPriority) return -1;
        if (!aPriority && bPriority) return 1;
        return 0;
      });

      sortedTags.forEach((tag: any) => {
        descriptions.push({
          tag: tag.tag,
          name: tag.name,
          content: tag.content || []
        });
      });
    }

    return descriptions;
  }

  /**
   * Format TypeDoc parameters into standardized FormatProjectValue array
   *
   * Implementation Details:
   * 1. Validates input parameters array
   * 2. Processes each parameter individually
   * 3. Handles object-type parameters by flattening their properties
   * 4. Generates nested property names for object parameters
   * 5. Extracts metadata for each parameter (default, since, deprecated, optional)
   *
   * Business Rules:
   * - Returns empty array for invalid or empty parameter arrays
   * - Processes object parameters by flattening their properties
   * - Uses dot notation for nested object properties (e.g., options.name)
   * - Extracts all metadata for each parameter
   * - Maintains original parameter order
   * - Handles both simple and complex parameter types
   *
   * Object Parameter Handling:
   * - Detects reflection-type parameters with children
   * - Adds parent parameter as first element
   * - Flattens child properties with parent prefix
   * - Preserves all metadata for both parent and children
   *
   * @param parameters - TypeDoc parameter reflection array
   * @returns Array of standardized FormatProjectValue objects
   *
   * @example Simple Parameters
   * ```typescript
   * const params = this.formatParameters([
   *   { name: 'user', type: { type: 'intrinsic', name: 'string' } }
   * ]);
   * // Returns: [{ name: 'user', typeString: 'string', ... }]
   * ```
   *
   * @example Object Parameters
   * ```typescript
   * const params = this.formatParameters([
   *   {
   *     name: 'options',
   *     type: {
   *       type: 'reflection',
   *       declaration: {
   *         children: [{ name: 'name', type: {...} }]
   *       }
   *     }
   *   }
   * ]);
   * // Returns: [
   * //   { name: 'options', typeString: 'Object', ... },
   * //   { name: 'options.name', typeString: 'string', ... }
   * // ]
   * ```
   */
  formatParameters(parameters: ParameterReflection[]): FormatProjectValue[] {
    if (!Array.isArray(parameters)) {
      return [];
    }

    const result: FormatProjectValue[] = [];

    parameters.forEach((param: any) => {
      // Check if the parameter is an object type (e.g., options)
      if (
        param.type?.type === 'reflection' &&
        param.type.declaration?.children
      ) {
        // First add the object parameter itself
        result.push({
          id: param.id,
          kind: param.kind,
          kindName: ReflectionKindName[
            param.kind as keyof typeof ReflectionKindName
          ] as any,
          name: param.name,
          typeString: this.getTypeString(param),
          descriptions: this.formatDescription(param.comment),
          defaultValue: this.getDefaultValue(param),
          since: this.getSinceVersion(param),
          deprecated: this.isDeprecated(param),
          optional: this.isOptional(param)
        });

        // Then expand its properties
        const objectChildren = param.type.declaration.children;
        objectChildren.forEach((child: any) => {
          result.push({
            id: child.id,
            kind: child.kind,
            kindName: ReflectionKindName[
              child.kind as keyof typeof ReflectionKindName
            ] as any,
            name: `${param.name}.${child.name}`, // Use options.name format
            typeString: this.getTypeString(child),
            descriptions: this.formatDescription(child.comment),
            defaultValue: this.getDefaultValue(child),
            since: this.getSinceVersion(child),
            deprecated: this.isDeprecated(child),
            optional: this.isOptional(child)
          });
        });
      } else {
        // Normal parameter
        result.push({
          id: param.id,
          kind: param.kind,
          kindName: ReflectionKindName[
            param.kind as keyof typeof ReflectionKindName
          ] as any,
          name: param.name,
          typeString: this.getTypeString(param),
          descriptions: this.formatDescription(param.comment),
          defaultValue: this.getDefaultValue(param),
          since: this.getSinceVersion(param),
          deprecated: this.isDeprecated(param),
          optional: this.isOptional(param)
        });
      }
    });

    return result;
  }

  /**
   * Extract source file information from TypeDoc reflection object
   *
   * Implementation Details:
   * 1. Checks reflection.sources array for source file information
   * 2. Uses first source in array if multiple sources exist
   * 3. Falls back to reflection.source property if sources array is empty
   * 4. Returns undefined if no source information is available
   * 5. Extracts fileName, line, character, and url information
   *
   * Business Rules:
   * - Prioritizes reflection.sources array over reflection.source
   * - Uses first source when multiple sources exist
   * - Returns undefined for reflections without source information
   * - Preserves all source metadata (file, line, character, url)
   * - Handles both single and multiple source scenarios
   *
   * Source Information:
   * - fileName: Source file path
   * - line: Line number in source file
   * - character: Character position on line
   * - url: Generated URL for source location
   *
   * @param reflection - TypeDoc reflection object
   * @returns Source file information object, or undefined if not available
   *
   * @example With Sources Array
   * ```typescript
   * this.getSourceInfo({
   *   sources: [{
   *     fileName: 'src/user.ts',
   *     line: 10,
   *     character: 5
   *   }]
   * });
   * // Returns: { fileName: 'src/user.ts', line: 10, character: 5, url: undefined }
   * ```
   *
   * @example With Single Source
   * ```typescript
   * this.getSourceInfo({
   *   source: {
   *     fileName: 'src/auth.ts',
   *     line: 25,
   *     character: 10
   *   }
   * });
   * // Returns: { fileName: 'src/auth.ts', line: 25, character: 10, url: undefined }
   * ```
   *
   * @example No Source Information
   * ```typescript
   * this.getSourceInfo({ name: 'UserService' });
   * // Returns: undefined
   * ```
   */
  private getSourceInfo(reflection: any): FormatProjectSource | undefined {
    // Get first source file information from sources array first
    if (
      reflection.sources &&
      Array.isArray(reflection.sources) &&
      reflection.sources.length > 0
    ) {
      const source = reflection.sources[0];
      return {
        fileName: source.fileName,
        line: source.line,
        character: source.character,
        url: source.url
      };
    }

    // If there are no sources, try to get source information from the source property
    if (reflection.source) {
      return {
        fileName: reflection.source.fileName,
        line: reflection.source.line,
        character: reflection.source.character,
        url: reflection.source.url
      };
    }

    return undefined;
  }
}
