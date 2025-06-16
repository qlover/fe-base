import type Code2MDContext from '../../implments/Code2MDContext';
import {
  Application,
  ProjectReflection,
  TSConfigReader,
  TypeDocReader
} from 'typedoc';
import { ScriptPlugin } from '../../scripts-plugin';
import fsExtra from 'fs-extra';

/**
 * Interface for comment table data structure
 *
 * @purpose Defines the structure for organizing TypeDoc comments into table format
 * @core Provides a standardized way to represent comment information
 * @functionality Structures comment data for easy table generation
 * @usage Used by extractCommentsToTable method to organize comment data
 *
 * @example
 * ```typescript
 * const tableData: CommentTableData = {
 *   name: "ExampleClass",
 *   kind: "class",
 *   summary: "This is an example class",
 *   description: "Detailed description",
 *   tags: [
 *     { tag: "@example", content: "const example = new ExampleClass()" }
 *   ],
 *   children: [
 *     {
 *       name: "debug",
 *       kind: "property",
 *       summary: "Debug flag"
 *     }
 *   ]
 * };
 * ```
 */
interface CommentTableData {
  /** Element name */
  name: string;
  /** Element kind (class, method, property, etc.) */
  kind: string;
  /** Summary text */
  summary: string;
  /** Description content */
  description: string;
  /** Block tags information */
  tags: Array<{
    tag: string;
    name?: string;
    content: string;
  }>;
  /** Source file information */
  source?: {
    fileName: string;
    line: number;
    url?: string;
  };
  /** Child elements */
  children?: CommentTableData[];
}

/**
 * TypeDoc reflection interface for type safety
 */
interface TypeDocReflection {
  id?: number;
  name: string;
  kind: number;
  comment?: {
    summary?: Array<{ kind: string; text: string }>;
    blockTags?: Array<{
      tag: string;
      name?: string;
      content?: Array<{ kind: string; text: string }>;
    }>;
  };
  signatures?: TypeDocReflection[];
  children?: TypeDocReflection[];
  parameters?: Array<{
    name: string;
    flags?: { isOptional?: boolean };
  }>;
  sources?: Array<{
    fileName: string;
    line: number;
    url?: string;
  }>;
  type?: {
    declaration?: {
      children?: TypeDocReflection[];
    };
  };
}

export default class TypeDocJson extends ScriptPlugin<Code2MDContext> {
  private app?: Application;

  constructor(context: Code2MDContext) {
    super(context, 'TypeDocJson');
  }

  async getApp(): Promise<Application> {
    if (this.app) {
      return this.app;
    }

    const app = await Application.bootstrap(
      {
        // typedoc options here
        basePath: this.context.options.basePath,
        entryPoints: this.context.options.entryPoints,
        skipErrorChecking: true
      },
      [new TSConfigReader(), new TypeDocReader()]
    );

    this.app = app;
    return app;
  }

  override async onBefore(): Promise<void> {
    const app = await this.getApp();
    const project = await app.convert();

    if (!project) {
      throw new Error('Failed to convert project');
    }

    this.context.setConfig({ projectReflection: project });

    // Extract comments to table format
    // const projectData = app.serializer.projectToObject(project, './');
    const tableData = this.extractCommentsToTable(project as TypeDocReflection);

    this.writeJSON({ data: tableData }, './typedoc.json');
    // Log extracted data summary
    this.logger.info(`Extracted ${tableData.length} documented elements`);

    // Simple output of extracted data
    tableData.forEach((item) => {
      this.logger.info(
        `${item.kind}: ${item.name} - ${item.summary || 'No summary'}`
      );
    });

    await this.writeToFile(project);
  }

  /**
   * Extracts comments from TypeDoc JSON and organizes them into hierarchical table format
   *
   * @purpose Converts TypeDoc comment structure into a hierarchical table data format
   * @core Recursively processes TypeDoc JSON to extract all comment information with parent-child relationships
   * @functionality Parses summary, description, and block tags from TypeDoc comments and organizes them hierarchically
   * @usage Call this method with TypeDoc JSON data to get organized hierarchical comment table data
   *
   * @param jsonData - The TypeDoc JSON data object
   * @returns Array of CommentTableData representing all comments in hierarchical format
   *
   * @example
   * ```typescript
   * const typeDocJson = new TypeDocJson(context);
   * const jsonData = JSON.parse(fs.readFileSync('typedoc.json', 'utf-8'));
   * const tableData = typeDocJson.extractCommentsToTable(jsonData);
   *
   * // Access hierarchical data
   * tableData.forEach(item => {
   *   console.log(`${item.kind}: ${item.name}`);
   *   if (item.children) {
   *     item.children.forEach(child => {
   *       console.log(`  - ${child.kind}: ${child.name}`);
   *     });
   *   }
   * });
   * ```
   */
  extractCommentsToTable(jsonData: TypeDocReflection): CommentTableData[] {
    const results: CommentTableData[] = [];

    /**
     * Recursively processes TypeDoc reflection objects to extract comment data
     *
     * @param reflection - TypeDoc reflection object
     * @returns CommentTableData object or null if no valid data
     */
    const processReflection = (
      reflection: TypeDocReflection
    ): CommentTableData | null => {
      if (!reflection) return null;

      // Create base data for current reflection
      let currentData: CommentTableData | null = null;

      // Process current reflection if it has comments
      if (reflection.comment) {
        currentData = this.parseCommentToTableData(reflection, reflection.name);
      }

      // If no comment data, create basic structure for elements with children
      if (!currentData && (reflection.children || reflection.signatures)) {
        currentData = {
          name: reflection.name,
          kind: this.getKindName(reflection.kind),
          summary: '',
          description: '',
          tags: [],
          source: reflection.sources?.[0]
            ? {
                fileName: reflection.sources[0].fileName,
                line: reflection.sources[0].line,
                url: reflection.sources[0].url
              }
            : undefined
        };
      }

      if (!currentData) return null;

      // Process children
      const children: CommentTableData[] = [];

      // Process signatures (for methods, constructors, etc.)
      if (reflection.signatures) {
        reflection.signatures.forEach((signature: TypeDocReflection) => {
          if (signature.comment) {
            const signatureName = `${reflection.name}(${this.getParameterNames(
              signature.parameters
            )})`;
            const signatureData = this.parseCommentToTableData(
              signature,
              signatureName
            );
            if (signatureData) {
              // For signatures, we usually want to merge with parent or replace parent data
              if (
                signatureData.summary ||
                signatureData.description ||
                signatureData.tags.length > 0
              ) {
                currentData!.summary =
                  signatureData.summary || currentData!.summary;
                currentData!.description =
                  signatureData.description || currentData!.description;
                currentData!.tags = [
                  ...currentData!.tags,
                  ...signatureData.tags
                ];
              }
            }
          }
        });
      }

      // Process child reflections
      if (reflection.children) {
        reflection.children.forEach((child: TypeDocReflection) => {
          const childData = processReflection(child);
          if (childData) {
            children.push(childData);
          }
        });
      }

      // Process type declaration children (for type aliases, interfaces)
      if (reflection.type?.declaration?.children) {
        reflection.type.declaration.children.forEach(
          (child: TypeDocReflection) => {
            const childData = processReflection(child);
            if (childData) {
              children.push(childData);
            }
          }
        );
      }

      // Add children to current data if any exist
      if (children.length > 0) {
        currentData.children = children;
      }

      return currentData;
    };

    // Start processing from root children
    if (jsonData.children) {
      jsonData.children.forEach((child: TypeDocReflection) => {
        const childData = processReflection(child);
        if (childData) {
          results.push(childData);
        }
      });
    }

    return results;
  }

  /**
   * Parses a single TypeDoc comment into table data format
   *
   * @purpose Converts individual TypeDoc comment structure to CommentTableData
   * @core Extracts summary, description, and block tags from comment object
   * @functionality Handles different comment content types (text, code)
   * @usage Used internally by extractCommentsToTable to process individual comments
   *
   * @param reflection - TypeDoc reflection object with comment
   * @param name - Element name
   * @returns CommentTableData object or null if no valid comment
   */
  private parseCommentToTableData(
    reflection: TypeDocReflection,
    name: string
  ): CommentTableData | null {
    const comment = reflection.comment;
    if (!comment) return null;

    // Extract summary
    const summary =
      comment.summary
        ?.map((item) => item.text || '')
        .join('')
        .trim() || '';

    // Extract description from @description tag
    let description = '';
    const tags: Array<{ tag: string; name?: string; content: string }> = [];

    if (comment.blockTags) {
      comment.blockTags.forEach((blockTag) => {
        const content =
          blockTag.content
            ?.map((item) => {
              if (item.kind === 'text') return item.text;
              if (item.kind === 'code') return item.text;
              return '';
            })
            .join('')
            .trim() || '';

        if (blockTag.tag === '@description') {
          description = content;
        } else {
          tags.push({
            tag: blockTag.tag,
            name: blockTag.name,
            content
          });
        }
      });
    }

    // Extract source information
    let source;
    if (reflection.sources && reflection.sources[0]) {
      const sourceInfo = reflection.sources[0];
      source = {
        fileName: sourceInfo.fileName,
        line: sourceInfo.line,
        url: sourceInfo.url
      };
    }

    return {
      name,
      kind: this.getKindName(reflection.kind),
      summary,
      description,
      tags,
      source
    };
  }

  /**
   * Gets parameter names from signature parameters
   *
   * @purpose Extracts parameter names for method signature display
   * @core Processes parameter array to get comma-separated names
   * @functionality Handles optional parameters and type information
   * @usage Used to generate readable method signatures
   *
   * @param parameters - Array of parameter objects
   * @returns Comma-separated parameter names string
   */
  private getParameterNames(
    parameters?: Array<{ name: string; flags?: { isOptional?: boolean } }>
  ): string {
    if (!parameters || parameters.length === 0) return '';

    return parameters
      .map((param) => {
        const optional = param.flags?.isOptional ? '?' : '';
        return `${param.name}${optional}`;
      })
      .join(', ');
  }

  /**
   * Converts TypeDoc kind number to readable string
   *
   * @purpose Maps TypeDoc kind enumeration to human-readable names
   * @core Provides mapping from numeric kind values to descriptive strings
   * @functionality Handles all common TypeDoc reflection kinds
   * @usage Used to display element types in table format
   *
   * @param kind - TypeDoc kind number
   * @returns Human-readable kind name
   */
  private getKindName(kind: number): string {
    const kindMap: Record<number, string> = {
      1: 'project',
      128: 'class',
      256: 'interface',
      512: 'constructor',
      1024: 'property',
      2048: 'method',
      4096: 'signature',
      16384: 'constructor-signature',
      32768: 'parameter',
      65536: 'type-literal',
      2097152: 'type-alias'
    };

    return kindMap[kind] || `unknown(${kind})`;
  }

  async writeToFile(project: ProjectReflection): Promise<void> {
    const path = this.context.options.outputJSONFilePath;

    if (!path) {
      this.logger.warn('ProjectReader writeTo Ouput path is empty!');
      return;
    }

    const app = await this.getApp();

    this.writeJSON(app.serializer.projectToObject(project, './'), path);
    this.logger.info('Generate JSON file success', path);
  }

  writeJSON(value: unknown, path: string): void {
    if (!path) {
      this.logger.warn('ProjectReader writeJSON Ouput path is empty!');
      return;
    }

    fsExtra.removeSync(path);
    fsExtra.ensureFileSync(path);
    fsExtra.writeFileSync(path, JSON.stringify(value, null, 2), 'utf-8');
  }

  /**
   * Generates a markdown table from extracted comment data
   *
   * @purpose Converts CommentTableData array to formatted markdown table
   * @core Creates table with columns for name, kind, and summary
   * @functionality Handles hierarchical structure with proper indentation
   * @usage Used to output extracted comments in readable markdown format
   *
   * @param tableData - Array of CommentTableData to convert
   * @param indentLevel - Current indentation level for hierarchical display
   * @returns Formatted markdown table string
   *
   * @example
   * ```typescript
   * const comments = this.extractCommentsToTable(jsonData);
   * const markdown = this.generateMarkdownTable(comments);
   * console.log(markdown);
   * // Output:
   * // | Name | Kind | Summary |
   * // |------|------|---------|
   * // | ExampleClass | class | A sample class |
   * // | ├─ debug | property | Debug flag |
   * // | └─ getName | method | Gets the name |
   * ```
   */
  generateMarkdownTable(
    tableData: CommentTableData[],
    indentLevel: number = 0
  ): string {
    if (!tableData || tableData.length === 0) {
      return '| Name | Kind | Summary |\n|------|------|---------|';
    }

    const rows: string[] = [];

    // Add header only at top level
    if (indentLevel === 0) {
      rows.push('| Name | Kind | Summary |');
      rows.push('|------|------|---------|');
    }

    const processItems = (
      items: CommentTableData[],
      level: number,
      isLast: boolean[] = []
    ) => {
      items.forEach((item, index) => {
        const isLastItem = index === items.length - 1;
        const currentIsLast = [...isLast, isLastItem];

        // Create indentation prefix for hierarchical display
        let prefix = '';
        if (level > 0) {
          // Build tree-like prefix
          for (let i = 0; i < level - 1; i++) {
            prefix += isLast[i] ? '   ' : '│  ';
          }
          prefix += isLastItem ? '└─ ' : '├─ ';
        }

        // Escape pipe characters in content
        const escapedName = `${prefix}${item.name}`.replace(/\|/g, '\\|');
        const escapedKind = item.kind.replace(/\|/g, '\\|');
        const escapedSummary = item.summary.replace(/\|/g, '\\|');

        rows.push(`| ${escapedName} | ${escapedKind} | ${escapedSummary} |`);

        // Process children recursively
        if (item.children && item.children.length > 0) {
          processItems(item.children, level + 1, currentIsLast);
        }
      });
    };

    processItems(tableData, indentLevel);

    return rows.join('\n');
  }
}
