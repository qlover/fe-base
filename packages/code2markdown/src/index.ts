/**
 * @module code2markdown
 * @description Code to Markdown Documentation Generator
 *
 * Core concept:
 * A comprehensive toolchain for converting TypeScript/JavaScript source code into
 * well-structured Markdown documentation. Built on TypeDoc for code analysis and
 * Handlebars for flexible template-based output generation.
 *
 * Main features:
 * - Code parsing and analysis: TypeDoc-powered TypeScript/JavaScript parsing
 *   - Extract classes, interfaces, functions, types
 *   - Parse JSDoc comments and type annotations
 *   - Maintain source code relationships and hierarchies
 *   - Support for complex TypeScript features
 *
 * - Documentation generation: Template-based markdown output
 *   - Handlebars template engine for flexible formatting
 *   - Built-in templates for common documentation patterns
 *   - Custom template support for project-specific needs
 *   - Hierarchical documentation structure
 *
 * - Plugin architecture: Extensible reader and formatter system
 *   - Reader plugins: Custom source code readers
 *   - Formatter plugins: Custom output formatters
 *   - Composable plugin pipeline
 *   - Easy integration with existing workflows
 *
 * - CLI and programmatic API: Multiple usage modes
 *   - Command-line interface for quick documentation generation
 *   - Programmatic API for build tool integration
 *   - Configuration file support
 *   - Batch processing capabilities
 *
 * Use cases:
 * - API documentation: Generate comprehensive API docs from source code
 * - Project documentation: Maintain up-to-date documentation alongside code
 * - Type reference: Create type definition references
 * - Code exploration: Generate navigable code structure documentation
 *
 * ## Exported Members
 *
 * ### Core Components
 *
 * - **Code2MDContext**: Main context class managing the conversion process
 *   - Orchestrates the entire documentation generation workflow
 *   - Manages configuration and state
 *   - Coordinates reader and formatter plugins
 *   - Handles file system operations
 *
 * - **Code2MDTask**: Task executor for specific conversion operations
 *   - Encapsulates individual conversion tasks
 *   - Supports parallel task execution
 *   - Provides task-level configuration
 *   - Enables granular control over conversion process
 *
 * - **HBSTemplate**: Handlebars template processing utilities
 *   - Template compilation and rendering
 *   - Custom helper functions
 *   - Template inheritance and partials
 *   - Context data preparation
 *
 * ### Plugin System
 *
 * - **Formats**: Collection of formatting plugins
 *   - Built-in formatters for common patterns
 *   - Custom formatter support
 *   - Output transformation pipeline
 *
 * - **Reader**: Code reader plugins
 *   - TypeDoc-based code readers
 *   - File system readers
 *   - Custom reader implementations
 *
 * - **TypeDocJson**: TypeDoc utilities and type definitions
 *   - TypeDoc reflection data types
 *   - Utility functions for TypeDoc data
 *   - Type-safe TypeDoc integration
 *
 * ## Basic Usage
 *
 * ### Simple Documentation Generation
 *
 * ```typescript
 * import { Code2MDContext } from '@qlover/code2markdown';
 *
 * // Initialize context with minimal configuration
 * const context = new Code2MDContext({
 *   sourcePath: 'src',
 *   generatePath: 'docs'
 * });
 *
 * // Execute conversion
 * await context.execute();
 * ```
 *
 * ### With Exclusions
 *
 * ```typescript
 * const context = new Code2MDContext({
 *   sourcePath: 'src',
 *   generatePath: 'docs',
 *   exclude: ['src/test', '__tests__', 'node_modules']
 * });
 *
 * await context.execute();
 * ```
 *
 * ## Advanced Configuration
 *
 * ### Custom Task Configuration
 *
 * ```typescript
 * import { Code2MDContext, Code2MDTask } from '@qlover/code2markdown';
 *
 * // Create custom task with specific settings
 * const task = new Code2MDTask({
 *   sourcePath: 'packages/core/src',
 *   generatePath: 'docs/api',
 *   templatePath: 'templates/custom.hbs',
 *   exclude: ['*.test.ts']
 * });
 *
 * // Execute custom task
 * await task.run();
 * ```
 *
 * ### Multiple Source Processing
 *
 * ```typescript
 * const context = new Code2MDContext({
 *   sourcePath: 'src',
 *   generatePath: 'docs'
 * });
 *
 * // Process multiple packages
 * const packages = ['core', 'utils', 'components'];
 * for (const pkg of packages) {
 *   await context.execute({
 *     sourcePath: `packages/${pkg}/src`,
 *     generatePath: `docs/${pkg}`
 *   });
 * }
 * ```
 *
 * ### Custom Template Usage
 *
 * ```typescript
 * import { Code2MDContext, HBSTemplate } from '@qlover/code2markdown';
 *
 * // Register custom Handlebars helpers
 * HBSTemplate.registerHelper('customFormat', (value) => {
 *   return value.toUpperCase();
 * });
 *
 * // Use custom template
 * const context = new Code2MDContext({
 *   sourcePath: 'src',
 *   generatePath: 'docs',
 *   templatePath: 'templates/my-template.hbs'
 * });
 *
 * await context.execute();
 * ```
 *
 * ## CLI Usage
 *
 * ```bash
 * # Basic usage
 * code2markdown --source src --output docs
 *
 * # With exclusions
 * code2markdown --source src --output docs --exclude "test,__tests__"
 *
 * # With custom template
 * code2markdown --source src --output docs --template custom.hbs
 * ```
 *
 * ## Plugin Development
 *
 * ### Custom Reader Plugin
 *
 * ```typescript
 * import { Reader } from '@qlover/code2markdown';
 *
 * const customReader = {
 *   name: 'custom-reader',
 *   read: async (sourcePath: string) => {
 *     // Custom reading logic
 *     return {
 *       files: [...],
 *       data: {...}
 *     };
 *   }
 * };
 *
 * // Register and use
 * context.registerReader(customReader);
 * ```
 *
 * ### Custom Formatter Plugin
 *
 * ```typescript
 * import { Formats } from '@qlover/code2markdown';
 *
 * const customFormatter = {
 *   name: 'custom-formatter',
 *   format: (data) => {
 *     // Custom formatting logic
 *     return formattedMarkdown;
 *   }
 * };
 *
 * // Register and use
 * context.registerFormatter(customFormatter);
 * ```
 *
 * ## Related Documentation
 *
 * - [CLI Usage Guide](./cli.md) - Command-line interface documentation
 * - [Template System Guide](./implments/HBSTemplate.md) - Handlebars template system
 * - [Plugin Development](./plugins/) - Creating custom plugins
 * - [Type Definitions](./type.md) - TypeScript type definitions
 *
 * @see [TypeDoc Documentation](https://typedoc.org/) for underlying parsing engine
 * @see [Handlebars Documentation](https://handlebarsjs.com/) for template syntax
 */

export * from './implments/Code2MDContext';
export * from './implments/HBSTemplate';
export * from './implments/Code2MDTask';
export * from './plugins/formats';
export * from './plugins/reader';
export * from './plugins/typeDocs';
export * from './type';
