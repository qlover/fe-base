/**
 * @module code2markdown
 * @description Code to Markdown Documentation Generator
 *
 * This module provides a comprehensive toolchain for converting code files to Markdown documentation.
 * Core features include:
 * - TypeScript/JavaScript code parsing
 * - Type definitions and interface documentation generation
 * - Custom template support (Handlebars-based)
 * - Plugin architecture with custom readers and formatters
 *
 * ### Exported Members
 *
 * - Code2MDContext: Core context class managing the conversion process
 * - Code2MDTask: Task executor handling specific conversion tasks
 * - HBSTemplate: Handlebars template processing utilities
 * - Formats: Collection of formatting plugins
 * - Reader: Code reader plugins
 * - TypeDocJson: TypeDoc related utilities and types
 *
 * ### Basic Usage
 * ```typescript
 * import { Code2MDContext } from '@qlover/code2markdown';
 *
 * // Initialize context
 * const context = new Code2MDContext({
 *   sourcePath: 'src',
 *   generatePath: 'docs'
 * });
 *
 * // Execute conversion
 * await context.execute();
 * ```
 *
 * ### Advanced Configuration
 * ```typescript
 * import { Code2MDContext, Code2MDTask } from '@qlover/code2markdown';
 *
 * // Custom task configuration
 * const task = new Code2MDTask({
 *   sourcePath: 'packages/core/src',
 *   generatePath: 'docs/api',
 *   templatePath: 'templates/custom.hbs'
 * });
 *
 * // Execute custom task
 * await task.run();
 * ```
 *
 * ### Related Documentation
 * - [CLI Usage Guide](./cli.md)
 * - [Template System Guide](./implments/HBSTemplate.md)
 */

export * from './implments/Code2MDContext';
export * from './implments/HBSTemplate';
export * from './implments/Code2MDTask';
export * from './plugins/formats';
export * from './plugins/reader';
export * from './plugins/typeDocs';
export * from './type';
