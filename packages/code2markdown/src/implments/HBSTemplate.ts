import fsExtra from 'fs-extra';
import { join, resolve } from 'path';
import Handlebars from 'handlebars';
import { ReflectionKind } from 'typedoc';
import { FormatProjectValue, ReflectionKindName } from '../type';
import { ValueOf } from '@qlover/fe-corekit';

/**
 * Type mapping for organizing reflection data by kind
 *
 * This type creates a record structure where each key is a reflection kind name
 * and the value is an array of formatted project values. This allows for
 * organized processing of different code element types during template compilation.
 *
 * @example
 * ```typescript
 * const contextMap: FormatProjectValueMap = {
 *   Interface: [...],
 *   Class: [...],
 *   Function: [...],
 *   // ... other reflection kinds
 * };
 * ```
 */
export type FormatProjectValueMap = Record<
  ValueOf<typeof ReflectionKindName>,
  FormatProjectValue[]
>;

/**
 * Handlebars template processor for code-to-markdown conversion
 *
 * Core Responsibilities:
 * - Loads and manages Handlebars template files
 * - Compiles templates with reflection data
 * - Organizes and processes different code element types
 * - Provides custom helper functions for template processing
 *
 * Main Features:
 * - Template Management: Loads template files from specified directories
 *   - Supports both `.hbs` and non-extension template names
 *   - Resolves template paths relative to root directory
 *   - Caches template content for efficient reuse
 *
 * - Helper Registration: Supports custom Handlebars helper functions
 *   - Registers helpers during template initialization
 *   - Enables custom formatting and processing logic
 *   - Maintains helper state throughout template lifecycle
 *
 * - Compilation Methods: Provides multiple compilation strategies
 *   - Single context compilation for individual elements
 *   - Batch compilation for organized reflection data
 *   - Ordered processing based on reflection kind priority
 *
 * Design Considerations:
 * - Uses file system operations for template loading
 * - Maintains template content in memory for performance
 * - Supports flexible helper registration for extensibility
 * - Implements ordered processing for consistent output structure
 *
 * Template Processing Order:
 * 1. Interface definitions
 * 2. Type aliases
 * 3. Class definitions
 * 4. Function declarations
 * 5. Variable declarations
 * 6. Enum definitions
 * 7. Other reflection kinds
 *
 * @example Basic Usage
 * ```typescript
 * const template = new HBSTemplate({
 *   name: 'class-template',
 *   hbsRootDir: './templates'
 * });
 *
 * const output = template.compile(reflectionData);
 * ```
 *
 * @example With Custom Helpers
 * ```typescript
 * const template = new HBSTemplate({
 *   name: 'api-docs',
 *   hbsRootDir: './templates',
 *   hbsHelpers: {
 *     formatType: (type) => type.replace('|', ' \\| '),
 *     capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1)
 *   }
 * });
 * ```
 *
 * @example Batch Compilation
 * ```typescript
 * const template = new HBSTemplate({ name: 'docs', hbsRootDir: './templates' });
 * const output = template.compileSource(contextMap);
 * ```
 */
export class HBSTemplate {
  /**
   * Cached template content loaded from file system
   *
   * This property stores the raw template content after loading from the
   * specified template file. It is cached to avoid repeated file system
   * operations during multiple compilation calls.
   *
   * @private Internal use only - template content cache
   */
  private templateContent: string;

  /**
   * Creates a new HBSTemplate instance with the specified configuration
   *
   * During construction, the template processor:
   * 1. Resolves the template file path based on name and root directory
   * 2. Loads template content from the file system
   * 3. Registers any provided custom helper functions
   * 4. Caches the template content for efficient reuse
   *
   * @param options - Template configuration options
   * @param {string} [options.name='context'] - Template name (with or without .hbs extension)
   * @param {string} options.hbsRootDir - Root directory containing template files
   * @param {Record<string, Handlebars.HelperDelegate>} [options.hbsHelpers] - Custom Handlebars helper functions
   *
   * @throws {Error} When template file cannot be found or read
   * @throws {Error} When helper registration fails
   *
   * @example Basic Construction
   * ```typescript
   * const template = new HBSTemplate({
   *   name: 'class-template',
   *   hbsRootDir: './templates'
   * });
   * ```
   *
   * @example With File Extension
   * ```typescript
   * const template = new HBSTemplate({
   *   name: 'interface.hbs',
   *   hbsRootDir: './templates'
   * });
   * ```
   *
   * @example With Custom Helpers
   * ```typescript
   * const template = new HBSTemplate({
   *   name: 'docs',
   *   hbsRootDir: './templates',
   *   hbsHelpers: {
   *     formatDescription: (text) => text.replace(/\n/g, ' '),
   *     getTypeName: (type) => type.name || 'unknown'
   *   }
   * });
   * ```
   */
  constructor({
    name = 'context',
    hbsRootDir,
    hbsHelpers
  }: {
    name?: string;
    hbsRootDir: string;
    hbsHelpers?: Record<string, Handlebars.HelperDelegate>;
  }) {
    // Determine template file name with proper extension
    const tplFile = name.includes('.hbs') ? name : name + '.hbs';

    // Resolve absolute path for template root directory
    const resolvedHbsRootDir = resolve(hbsRootDir);

    // Load template content from file system
    this.templateContent = fsExtra.readFileSync(
      join(resolvedHbsRootDir, tplFile),
      'utf-8'
    );

    // Register custom helper functions if provided
    if (hbsHelpers) {
      Object.entries(hbsHelpers).forEach(([key, value]) => {
        Handlebars.registerHelper(key, value);
      });
    }
  }

  /**
   * Retrieves the raw template content
   *
   * This method returns the cached template content that was loaded during
   * construction. It can be useful for debugging, validation, or when
   * you need to inspect the template before compilation.
   *
   * @returns The raw template content as a string
   *
   * @example
   * ```typescript
   * const template = new HBSTemplate({ name: 'docs', hbsRootDir: './templates' });
   * const content = template.getTemplate();
   * console.log('Template content:', content);
   * ```
   */
  public getTemplate(): string {
    return this.templateContent;
  }

  /**
   * Compiles template with a single reflection context
   *
   * This method compiles the template using Handlebars with a single
   * reflection context. It's suitable for processing individual code
   * elements or when you need fine-grained control over the compilation
   * process.
   *
   * @param context - Reflection data to compile with template
   * @param options - Handlebars runtime options for compilation
   * @default `undefined`
   *
   * @returns Compiled template string with context data
   *
   * @throws {Error} When template compilation fails
   * @throws {Error} When context data is invalid
   *
   * @example Basic Compilation
   * ```typescript
   * const template = new HBSTemplate({ name: 'class', hbsRootDir: './templates' });
   * const output = template.compile(classReflection);
   * ```
   *
   * @example With Runtime Options
   * ```typescript
   * const output = template.compile(reflection, {
   *   allowProtoPropertiesByDefault: true,
   *   allowCallsToHelperMissing: true
   * });
   * ```
   */
  public compile(
    context: FormatProjectValue,
    options?: Handlebars.RuntimeOptions
  ): string {
    return Handlebars.compile(this.templateContent)(context, options);
  }

  /**
   * Compiles template with organized reflection data by kind
   *
   * This method processes reflection data organized by kind and compiles
   * the template for each element in a specific order. It ensures
   * consistent output structure by processing different code element
   * types in a predefined sequence.
   *
   * Processing Order:
   * 1. Interface definitions (highest priority)
   * 2. Type aliases
   * 3. Class definitions
   * 4. Function declarations
   * 5. Variable declarations
   * 6. Enum definitions
   * 7. Other reflection kinds (lowest priority)
   *
   * @param contextMap - Reflection data organized by reflection kind
   *
   * @returns Compiled template string with all reflection data
   *
   * @throws {Error} When template compilation fails for any element
   * @throws {Error} When context map structure is invalid
   *
   * @example Basic Batch Compilation
   * ```typescript
   * const template = new HBSTemplate({ name: 'docs', hbsRootDir: './templates' });
   * const output = template.compileSource(contextMap);
   * ```
   *
   * @example With Organized Data
   * ```typescript
   * const contextMap: FormatProjectValueMap = {
   *   Interface: [interface1, interface2],
   *   Class: [class1, class2],
   *   Function: [function1, function2],
   *   // ... other kinds
   * };
   *
   * const output = template.compileSource(contextMap);
   * ```
   */
  public compileSource(contextMap: FormatProjectValueMap): string {
    const output: string[] = [];

    // Define processing order for consistent output structure
    const types = [
      ReflectionKindName[ReflectionKind.Interface],
      ReflectionKindName[ReflectionKind.TypeAlias],
      ReflectionKindName[ReflectionKind.Class],
      ReflectionKindName[ReflectionKind.Function],
      ReflectionKindName[ReflectionKind.Variable],
      ReflectionKindName[ReflectionKind.Enum]
    ];

    // Process reflection kinds in defined order
    types.forEach((type) => {
      if (contextMap[type as keyof typeof contextMap]) {
        output.push(
          ...contextMap[type as keyof typeof contextMap].map((context) =>
            this.compile(context)
          )
        );
      }
    });

    // Process any remaining reflection kinds not in the predefined order
    Object.entries(contextMap).forEach(([type, contexts]) => {
      // eslint-disable-next-line
      !types.includes(type as (typeof types)[number]) &&
        output.push(...contexts.map((context) => this.compile(context)));
    });

    return output.join('\n');
  }
}
