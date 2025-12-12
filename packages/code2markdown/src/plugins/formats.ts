import { ScriptPlugin, ScriptPluginProps } from '@qlover/scripts-context';
import Code2MDContext from '../implments/Code2MDContext';
import { HBSTemplate } from '../implments/HBSTemplate';
import fsExtra from 'fs-extra';
import { join, dirname, resolve } from 'path';
import { mkdirSync } from 'fs';
import { hbsHelpers } from '../implments/hbsHelper';
import { FormatProjectValue } from '../type';

/**
 * Supported format output types for markdown files
 */
type FormatOutputType = 'eslint' | 'prettier';

/**
 * Configuration options for the Formats plugin
 */
export interface FormatsProps extends ScriptPluginProps {
  /**
   * Grouped file data for markdown generation
   * Maps file paths to their corresponding FormatProjectValue arrays
   */
  fileGroups?: Map<string, FormatProjectValue[]>;

  /**
   * HBS template root directory path
   *
   * @default './hbs'
   */
  hbsRootDir?: string;

  /**
   * Whether to remove the prefix of the entry point from generated file paths
   *
   * When enabled, the entry point root path will be stripped from the output file paths,
   * resulting in cleaner relative paths in the generated documentation.
   *
   * @default `false`
   */
  removePrefix?: boolean;

  /**
   * Format tool for output directory
   *
   * Specifies the tool to use for formatting the generated markdown files.
   * Supports 'eslint' and 'prettier' for consistent code style.
   */
  formatOutput?: FormatOutputType;
}

/**
 * Formats plugin for generating and formatting markdown documentation from TypeScript code
 *
 * Core Responsibilities:
 * - Parse and group TypeScript project data by source files
 * - Generate markdown documentation using Handlebars templates
 * - Support hierarchical documentation structure with nested children
 * - Format output files using ESLint or Prettier
 * - Handle file path processing and directory structure preservation
 *
 * Design Considerations:
 * - Uses Handlebars templates for flexible markdown generation
 * - Maintains original directory structure in output
 * - Provides configurable path prefix removal for cleaner output
 * - Implements error handling that doesn't affect main generation process
 * - Supports dry-run mode for testing without file system changes
 *
 * @example Basic Usage
 * ```typescript
 * const formats = new Formats(context);
 * await formats.onBefore(); // Generate markdown files
 * await formats.onSuccess(); // Format output directory
 * ```
 *
 * @example With Configuration
 * ```typescript
 * const formats = new Formats(context);
 * formats.setConfig({
 *   hbsRootDir: './custom-templates',
 *   removePrefix: true,
 *   formatOutput: 'prettier'
 * });
 * await formats.onBefore();
 * ```
 *
 * @example Advanced Usage with Error Handling
 * ```typescript
 * const formats = new Formats(context);
 * try {
 *   await formats.onBefore();
 *   await formats.onSuccess();
 * } catch (error) {
 *   // Handle generation errors
 *   console.error('Documentation generation failed:', error);
 * }
 * ```
 */
export class Formats extends ScriptPlugin<Code2MDContext, FormatsProps> {
  /**
   * Handlebars template instance for markdown generation
   */
  private hbsTemplate: HBSTemplate;

  /**
   * Initialize the Formats plugin with Handlebars template configuration
   *
   * @param context - Code2MD context containing project data and options
   */
  constructor(context: Code2MDContext) {
    super(context, 'formats');

    this.hbsTemplate = new HBSTemplate({
      name: 'format-project',
      hbsRootDir: this.getConfig('hbsRootDir'),
      hbsHelpers: hbsHelpers
    });
  }

  /**
   * Main execution method that generates markdown documentation
   *
   * Implementation Details:
   * 1. Groups project data by source file paths for organized output
   * 2. Ensures output directory exists with recursive creation
   * 3. Generates markdown content for each file group using Handlebars templates
   * 4. Writes markdown files with proper directory structure preservation
   * 5. Stores file groups in configuration for post-processing
   *
   * Business Rules:
   * - Each source file generates a separate markdown file
   * - Directory structure is preserved in output
   * - File extension is changed from .ts to .md
   * - HTML entities are decoded for proper markdown rendering
   * - Nested children are processed recursively for hierarchical structure
   *
   * @throws {Error} When file writing fails or directory creation fails
   * @throws {Error} When Handlebars template compilation fails
   *
   * @example
   * ```typescript
   * await formats.onBefore();
   * // Generates markdown files for all TypeScript source files
   * ```
   */
  public override async onBefore(): Promise<void> {
    const { formatProject = [] } = this.context.options;
    const fileGroups = this.groupByFile(formatProject);

    // Ensure output directory exists - resolve path when used
    const resolvedGeneratePath = resolve(this.context.options.generatePath);
    mkdirSync(resolvedGeneratePath, { recursive: true });

    // Generate independent markdown files for each file group
    fileGroups.forEach((items, filePath) => {
      const content: string[] = [];
      for (const item of items) {
        content.push(this.formatProjectValue(item));
      }

      const fileContent = content.join('\n');
      const markdownContent = this.generateMarkdownContent(fileContent);

      // Generate filename and write to file
      this.writeMarkdownFile(markdownContent, filePath);
    });

    this.setConfig({ fileGroups });
  }

  /**
   * Post-processing method for formatting generated markdown files
   *
   * Implementation Details:
   * 1. Checks if formatting is enabled in configuration
   * 2. Validates output directory exists before formatting
   * 3. Applies formatting using specified tool (ESLint or Prettier)
   * 4. Handles formatting errors gracefully without affecting main process
   * 5. Logs formatting results for debugging and monitoring
   *
   * Business Rules:
   * - Only executes if formatOutput is configured
   * - Formatting failures don't affect main documentation generation
   * - Supports both ESLint and Prettier formatting tools
   * - Processes all .md files in output directory recursively
   * - Provides detailed logging for troubleshooting
   *
   * @example
   * ```typescript
   * // Format with Prettier
   * formats.setConfig({ formatOutput: 'prettier' });
   * await formats.onSuccess();
   *
   * // Format with ESLint
   * formats.setConfig({ formatOutput: 'eslint' });
   * await formats.onSuccess();
   * ```
   *
   * @example Error Handling
   * ```typescript
   * try {
   *   await formats.onSuccess();
   * } catch (error) {
   *   // Formatting errors are logged but don't throw
   *   console.log('Formatting completed with warnings');
   * }
   * ```
   */
  public override async onSuccess(): Promise<void> {
    const { generatePath } = this.context.options;
    const formatOutput = this.getConfig('formatOutput');

    // Return early if formatting is not enabled
    if (formatOutput) {
      await this.formatDocument(generatePath, formatOutput as FormatOutputType);
    }
  }

  /**
   * Format markdown files in the output directory using specified tool
   *
   * Implementation Details:
   * 1. Resolves and validates the target output directory path
   * 2. Checks if output directory exists before proceeding
   * 3. Validates format tool is supported (eslint or prettier)
   * 4. Executes formatting command with appropriate error handling
   * 5. Logs formatting results and any warnings or errors
   *
   * Business Rules:
   * - Only processes directories that exist
   * - Supports ESLint and Prettier formatting tools
   * - Formatting failures are logged but don't affect main process
   * - Provides detailed logging for debugging and monitoring
   * - Handles unsupported format tools gracefully with warnings
   *
   * @param targetPath - Path to the output directory containing markdown files
   * @param formatOutput - Formatting tool to use ('eslint' or 'prettier')
   *
   * @throws {Error} When output directory validation fails
   *
   * @example
   * ```typescript
   * await formats.formatDocument('./docs/output', 'prettier');
   * ```
   *
   * @example Error Handling
   * ```typescript
   * try {
   *   await formats.formatDocument('./docs/output', 'eslint');
   * } catch (error) {
   *   // Handle validation errors
   *   console.error('Formatting failed:', error.message);
   * }
   * ```
   */
  public async formatDocument(
    targetPath: string,
    formatOutput: FormatOutputType
  ): Promise<void> {
    const resolvedGeneratePath = resolve(targetPath);
    this.logger.info(`Formatting output directory: ${resolvedGeneratePath}`);

    try {
      // Check if output directory exists
      if (!fsExtra.existsSync(resolvedGeneratePath)) {
        this.logger.warn(
          `Output directory does not exist: ${resolvedGeneratePath}`
        );
        return;
      }

      // Select formatting tool based on configuration
      if (formatOutput === 'eslint' || formatOutput === 'prettier') {
        await this.formatOutputDirectory(resolvedGeneratePath, formatOutput);
      } else {
        this.logger.warn(
          `Unknown format tool: ${formatOutput}. Supported: eslint, prettier`
        );
      }
    } catch (error) {
      this.logger.error(`Failed to format output directory: ${error}`);
      // Formatting failure should not affect main process, so only log error
    }
  }

  /**
   * Group FormatProjectValue items by their source file paths
   *
   * Implementation Details:
   * 1. Iterates through FormatProjectValue array
   * 2. Extracts source file path from each item
   * 3. Groups items by file path using Map data structure
   * 4. Handles items without source file paths gracefully
   * 5. Returns organized Map for efficient file-based processing
   *
   * Business Rules:
   * - Items without source file paths are excluded from grouping
   * - Multiple items from same file are grouped together
   * - Maintains original order of items within each group
   * - Returns empty Map if no valid items found
   * - File paths are used as-is without normalization
   *
   * @param data - Array of FormatProjectValue objects to group
   * @returns Map of file paths to FormatProjectValue arrays
   *
   * @example
   * ```typescript
   * const groups = formats.groupByFile(formatProjectData);
   * // Result: Map { 'src/user.ts' => [userClass, userInterface, ...] }
   * ```
   *
   * @example Handling Empty Data
   * ```typescript
   * const groups = formats.groupByFile([]);
   * console.log(groups.size); // 0
   * ```
   */
  public groupByFile(
    data: FormatProjectValue[]
  ): Map<string, FormatProjectValue[]> {
    const fileGroups = new Map<string, FormatProjectValue[]>();

    for (const item of data) {
      const filePath = item.source?.fileName;
      if (filePath) {
        fileGroups.set(filePath, [...(fileGroups.get(filePath) || []), item]);
      }
    }
    return fileGroups;
  }

  /**
   * Format a single FormatProjectValue item and its children recursively
   *
   * Implementation Details:
   * 1. Renders current item using Handlebars templates with level parameter
   * 2. Decodes HTML entities in generated content for proper markdown rendering
   * 3. Recursively processes child items with incremented level
   * 4. Combines parent and child content with proper line breaks
   * 5. Returns complete hierarchical markdown structure
   *
   * Business Rules:
   * - Root level items start with level 0
   * - Child items increment level by 1 for each nesting
   * - HTML entities are decoded to ensure proper markdown rendering
   * - Empty children arrays are handled gracefully
   * - Content is joined with newlines for proper formatting
   * - Level parameter is passed to Handlebars template for indentation
   *
   * @param data - FormatProjectValue item to format
   * @param level - Current nesting level (0 for root, increments for children)
   * @returns Formatted markdown string for the item and its children
   *
   * @throws {Error} When Handlebars template compilation fails
   *
   * @example
   * ```typescript
   * // Format root level item
   * const content = formats.formatProjectValue(classData, 0);
   *
   * // Format nested child item
   * const childContent = formats.formatProjectValue(methodData, 1);
   * ```
   *
   * @example Recursive Processing
   * ```typescript
   * // Process class with methods and properties
   * const classContent = formats.formatProjectValue({
   *   name: 'UserService',
   *   children: [
   *     { name: 'login', children: [] },
   *     { name: 'logout', children: [] }
   *   ]
   * }, 0);
   * ```
   */
  public formatProjectValue(
    data: FormatProjectValue,
    level: number = 0
  ): string {
    const content: string[] = [];

    // Render current element, passing level parameter
    const dataWithLevel = { ...data, level };
    const compiledContent = this.hbsTemplate.compile(dataWithLevel);
    const decodedContent = this.decodeHtmlEntities(compiledContent);
    content.push(decodedContent);

    // Recursively render children if they exist
    if (data.children && data.children.length > 0) {
      for (const child of data.children) {
        const childContent = this.formatProjectValue(child, level + 1);
        content.push(childContent);
      }
    }

    return content.join('\n');
  }

  /**
   * Decode HTML entities in generated markdown content
   *
   * Implementation Details:
   * 1. Defines mapping of HTML entities to their character equivalents
   * 2. Iterates through entity mappings using regular expressions
   * 3. Replaces all occurrences of each entity in the input text
   * 4. Handles both hex and decimal HTML entity formats
   * 5. Returns text with all entities converted to readable characters
   *
   * Business Rules:
   * - Processes entities in order of definition
   * - Uses global regex replacement for all occurrences
   * - Handles common entities: arrows, quotes, equals, backticks
   * - Returns original text if no entities found
   * - Case-sensitive entity matching for accuracy
   *
   * Supported Entities:
   * - `&gt;` → `>` (greater than)
   * - `&lt;` → `<` (less than)
   * - `&amp;` → `&` (ampersand)
   * - `&quot;` → `"` (double quote)
   * - `&#x3D;` → `=` (equals sign)
   * - `&#x60;` → `` ` `` (backtick)
   * - `&#x27;` → `'` (single quote)
   *
   * @param text - Text containing HTML entities
   * @returns Decoded text with HTML entities converted to characters
   *
   * @example
   * ```typescript
   * const decoded = formats.decodeHtmlEntities('&gt; &lt; &amp;');
   * // Result: '> < &'
   * ```
   *
   * @example Complex Entities
   * ```typescript
   * const decoded = formats.decodeHtmlEntities('&#x3D;&gt; &quot;test&quot;');
   * // Result: '=> "test"'
   * ```
   */
  private decodeHtmlEntities(text: string): string {
    const htmlEntities: Record<string, string> = {
      '&#x3D;&gt;': '=>',
      '&#x3D;': '=', // Equals sign
      '&#x60;': '`', // Backtick
      '&#x27;': "'", // Single quote
      '&gt;': '>',
      '&lt;': '<',
      '&amp;': '&',
      '&quot;': '"',
      '&#39;': "'"
    };

    let decodedText = text;
    Object.entries(htmlEntities).forEach(([entity, char]) => {
      decodedText = decodedText.replace(new RegExp(entity, 'g'), char);
    });

    return decodedText;
  }

  /**
   * Generate complete markdown document content
   *
   * Implementation Details:
   * 1. Takes file group content as input
   * 2. Processes content through markdown generation pipeline
   * 3. Returns formatted markdown document ready for file writing
   * 4. Currently returns content as-is for simplicity
   * 5. Designed for future extension with headers, metadata, etc.
   *
   * Business Rules:
   * - Returns content directly without additional processing
   * - Maintains original content structure and formatting
   * - Designed for extensibility with document-level enhancements
   * - Handles empty content gracefully
   * - Preserves line breaks and spacing from input
   *
   * Future Enhancements:
   * - Add document headers with file information
   * - Include metadata like generation timestamp
   * - Support custom document templates
   * - Add table of contents generation
   * - Include source file references
   *
   * @param fileContent - Content for the markdown file
   * @returns Complete markdown document content
   *
   * @example
   * ```typescript
   * const content = formats.generateMarkdownContent('# Class Documentation\n\n...');
   * // Returns: '# Class Documentation\n\n...'
   * ```
   */
  private generateMarkdownContent(fileContent: string): string {
    const content: string[] = [];

    // Write file content
    content.push(fileContent);

    return content.join('\n');
  }

  /**
   * Generate output filename from source file path
   *
   * Implementation Details:
   * 1. Processes file path based on removePrefix configuration
   * 2. Strips entry point root path when removePrefix is enabled
   * 3. Preserves full directory structure in output path
   * 4. Changes file extension from .ts to .md
   * 5. Handles path normalization for cross-platform compatibility
   *
   * Business Rules:
   * - Always changes .ts extension to .md
   * - Preserves directory structure unless removePrefix is enabled
   * - removePrefix strips entry point root path for cleaner output
   * - Handles both file and directory entry points
   * - Normalizes path separators for cross-platform support
   * - Returns relative paths for consistent output structure
   *
   * @param filePath - Source file path
   * @returns Output filename with .md extension
   *
   * @example
   * ```typescript
   * // Without removePrefix
   * formats.generateFileName('src/user.ts'); // 'src/user.md'
   *
   * // With removePrefix (entry: 'src/')
   * formats.generateFileName('src/user.ts'); // 'user.md'
   * ```
   *
   * @example Nested Directories
   * ```typescript
   * // With removePrefix (entry: 'src/')
   * formats.generateFileName('src/services/auth.ts'); // 'services/auth.md'
   * ```
   */
  private generateFileName(filePath: string): string {
    let processedPath = filePath;

    // Remove entry prefix if removePrefix is enabled
    if (this.getConfig('removePrefix')) {
      const originalPath = processedPath;
      processedPath = this.removeEntryPrefix(filePath);
      this.logger.debug(
        `Path processing: "${originalPath}" -> "${processedPath}"`
      );
    }

    // Preserve full directory structure, only change extension from .ts to .md
    return processedPath.replace(/\.ts$/, '.md');
  }

  /**
   * Remove entry point root path from file path
   *
   * Implementation Details:
   * 1. Normalizes path separators for cross-platform compatibility
   * 2. Determines entry directory from source path configuration
   * 3. Handles both file and directory entry points
   * 4. Finds longest matching prefix for accurate path stripping
   * 5. Removes matching prefix and normalizes resulting path
   *
   * Business Rules:
   * - Normalizes Windows backslashes to forward slashes
   * - Handles relative path prefixes (./) automatically
   * - Strips entry directory path when file path starts with it
   * - Returns original path if no matching prefix found
   * - Removes leading slash from result for clean relative paths
   * - Handles empty entry directories gracefully
   *
   * Path Processing Logic:
   * - File entries: extracts directory from file path
   * - Directory entries: uses directory path directly
   * - Relative paths: removes ./ prefix for matching
   * - Cross-platform: normalizes separators for consistency
   *
   * @param filePath - Source file path to process
   * @returns File path with entry prefix removed
   *
   * @example
   * ```typescript
   * // Entry: 'src/'
   * formats.removeEntryPrefix('src/user/auth.ts'); // 'user/auth.ts'
   *
   * // Entry: 'src/index.ts'
   * formats.removeEntryPrefix('src/user/auth.ts'); // 'user/auth.ts'
   * ```
   *
   * @example Cross-platform Paths
   * ```typescript
   * // Windows paths are normalized
   * formats.removeEntryPrefix('src\\user\\auth.ts'); // 'user/auth.ts'
   * ```
   */
  private removeEntryPrefix(filePath: string): string {
    const { sourcePath } = this.context.options;

    this.logger.debug(`Processing file: "${filePath}"`);
    this.logger.debug(`Entry points: ${JSON.stringify(sourcePath)}`);

    // Normalize path separators
    const normalizedFilePath = filePath.replace(/\\/g, '/');

    // Find longest matching prefix
    let longestPrefix = '';

    // Normalize entry path
    const normalizedEntry = sourcePath!.replace(/\\/g, '/');

    // Handle case where entry is a file
    let entryDir = normalizedEntry;
    if (entryDir.endsWith('.ts') || entryDir.endsWith('.js')) {
      const lastSlashIndex = entryDir.lastIndexOf('/');
      if (lastSlashIndex !== -1) {
        entryDir = entryDir.substring(0, lastSlashIndex);
      } else {
        // If no slash, it's a file in current directory
        entryDir = '';
      }
    }

    // Handle relative path prefix
    if (entryDir.startsWith('./')) {
      entryDir = entryDir.substring(2);
    }

    // Ensure entry directory ends with / (unless empty string)
    if (entryDir && !entryDir.endsWith('/')) {
      entryDir += '/';
    }

    this.logger.debug(`Entry: "${sourcePath}" -> EntryDir: "${entryDir}"`);

    // Check if file path starts with entry directory
    if (
      normalizedFilePath.startsWith(entryDir) &&
      entryDir.length > longestPrefix.length
    ) {
      longestPrefix = entryDir;
      this.logger.debug(`Found match! Longest prefix: "${longestPrefix}"`);
    }

    // Remove matching prefix if found
    if (longestPrefix) {
      const result = filePath.substring(longestPrefix.length);
      // Remove leading / if present
      const finalResult = result.startsWith('/') ? result.substring(1) : result;
      this.logger.debug(`Final result: "${filePath}" -> "${finalResult}"`);
      return finalResult;
    }

    // Return original path if no matching prefix found
    this.logger.debug(`No prefix found, returning original: "${filePath}"`);
    return filePath;
  }

  /**
   * Write markdown content to output file
   *
   * Implementation Details:
   * 1. Generates output filename from source file path
   * 2. Resolves output directory path for cross-platform compatibility
   * 3. Creates directory structure recursively if it doesn't exist
   * 4. Writes markdown content to file with UTF-8 encoding
   * 5. Provides detailed logging for successful writes and errors
   *
   * Business Rules:
   * - Creates complete directory structure as needed
   * - Uses UTF-8 encoding for proper character handling
   * - Generates filename by converting .ts to .md extension
   * - Preserves directory structure in output path
   * - Logs success and error information for debugging
   * - Throws errors for file system failures
   *
   * Error Handling:
   * - Directory creation failures are caught and logged
   * - File writing failures are caught and logged
   * - Errors are re-thrown to prevent silent failures
   * - Provides context in error messages for debugging
   *
   * @param markdownContent - Markdown content to write
   * @param filePath - Original source file path for filename generation
   *
   * @throws {Error} When file writing fails or directory creation fails
   * @throws {Error} When output path resolution fails
   *
   * @example
   * ```typescript
   * await formats.writeMarkdownFile('# User Class\n\n...', 'src/user.ts');
   * // Writes to: ./docs/output/user.md
   * ```
   *
   * @example Error Handling
   * ```typescript
   * try {
   *   await formats.writeMarkdownFile(content, 'src/user.ts');
   * } catch (error) {
   *   // Handle file system errors
   *   console.error('Failed to write file:', error.message);
   * }
   * ```
   */
  private async writeMarkdownFile(
    markdownContent: string,
    filePath: string
  ): Promise<void> {
    // Resolve path when used and join with filename
    const fileName = this.generateFileName(filePath);
    const resolvedGeneratePath = resolve(this.context.options.generatePath);
    const outputPath = join(resolvedGeneratePath, fileName);

    try {
      // Ensure output directory exists (including subdirectories)
      const outputDir = dirname(outputPath);
      mkdirSync(outputDir, { recursive: true });

      // Write file
      fsExtra.writeFileSync(outputPath, markdownContent, 'utf-8');

      this.logger.info(`Markdown documentation written to: ${outputPath}`);
    } catch (error) {
      this.logger.error(`Failed to write markdown file: ${error}`);
      throw error;
    }
  }

  /**
   * Format output directory using specified tool
   *
   * Implementation Details:
   * 1. Determines appropriate command based on format tool
   * 2. Constructs command with proper glob patterns for markdown files
   * 3. Executes command using shell execution with error handling
   * 4. Logs command execution and results for debugging
   * 5. Handles formatting failures gracefully without affecting main process
   *
   * Business Rules:
   * - Supports ESLint and Prettier formatting tools
   * - Uses npx for tool execution to ensure availability
   * - Processes all .md files in output directory recursively
   * - Formatting failures are logged but don't affect main process
   * - Provides detailed logging for successful and failed operations
   * - Supports dry-run mode for testing without actual execution
   *
   * Command Patterns:
   * - ESLint: `npx eslint "path\/\**\/*.md" --fix`
   * - Prettier: `npx prettier "path/**\/*.md" --write`
   * - Uses glob patterns for recursive file processing
   * - Includes appropriate flags for each tool
   *
   * @param outputPath - Path to output directory containing markdown files
   * @param formatTool - Formatting tool to use ('eslint' or 'prettier')
   *
   * @throws {Error} When unsupported format tool is specified
   * @throws {Error} When command execution fails
   *
   * @example
   * ```typescript
   * await formats.formatOutputDirectory('./docs/output', 'prettier');
   * // Executes: npx prettier "./docs/output/*.md" --write
   * ```
   *
   * @example Error Handling
   * ```typescript
   * try {
   *   await formats.formatOutputDirectory('./docs/output', 'eslint');
   * } catch (error) {
   *   // Formatting errors are logged but don't throw
   *   console.log('Formatting completed with warnings');
   * }
   * ```
   */
  private async formatOutputDirectory(
    outputPath: string,
    formatTool: 'eslint' | 'prettier'
  ): Promise<void> {
    const commands = {
      eslint: `npx eslint "${outputPath}/**/*.md" --fix`,
      prettier: `npx prettier "${outputPath}/**/*.md" --write`
    };

    const command = commands[formatTool];

    if (!command) {
      this.logger.error(`Unsupported format tool: ${formatTool}`);
      return;
    }

    this.logger.info(`Executing ${formatTool} on output directory...`);

    try {
      const result = await this.shell.exec(command, {
        silent: false, // Show command output
        dryRun: this.context.dryRun
      });

      this.logger.info(`${formatTool} formatting completed successfully`);
      this.logger.debug(`${formatTool} output: ${result}`);
    } catch (error) {
      this.logger.error(`${formatTool} formatting failed: ${error}`);
      // Formatting failure should not affect main process, so only log error
    }
  }
}
