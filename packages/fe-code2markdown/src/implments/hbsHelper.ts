/**
 * Handlebars helper functions for template processing
 *
 * Core Responsibilities:
 * - Provides utility functions for Handlebars template compilation
 * - Supports string manipulation, comparison, and logical operations
 * - Enables dynamic content generation in markdown templates
 * - Maintains consistent helper behavior across different template contexts
 *
 * Main Features:
 * - String Manipulation: Case conversion and string repetition
 *   - `toLowerCase`: Converts strings to lowercase
 *   - `repeat`: Repeats strings or content blocks
 *
 * - Comparison Operations: Equality and logical comparisons
 *   - `eq`: Performs strict equality comparison
 *   - `or`: Performs logical OR operation on multiple values
 *
 * - Mathematical Operations: Basic arithmetic functions
 *   - `add`: Performs addition on numeric values
 *
 * Design Considerations:
 * - Type-safe implementation with proper type checking
 * - Handles both block and regular helper syntax
 * - Provides fallback implementations for older environments
 * - Maintains backward compatibility with existing templates
 *
 * Usage Patterns:
 * - Regular helpers: `{{helperName arg1 arg2}}`
 * - Block helpers: `{{#helperName arg1}}content{{/helperName}}`
 * - Nested helpers: `{{helper1 (helper2 arg)}}`
 *
 * @example Basic Usage
 * ```handlebars
 * {{toLowerCase "HELLO WORLD"}}
 * {{#if (eq status "active")}}Active{{/if}}
 * {{repeat 3 "---"}}
 * ```
 *
 * @example Block Helper Usage
 * ```handlebars
 * {{#repeat 3}}
 * # Section {{add @index 1}}
 * {{/repeat}}
 * ```
 *
 * @example Logical Operations
 * ```handlebars
 * {{#if (or hasTitle hasDescription)}}
 * Content available
 * {{/if}}
 * ```
 */
export const hbsHelpers: Record<string, Handlebars.HelperDelegate> = {
  /**
   * Converts a string to lowercase
   *
   * This helper safely converts string values to lowercase while preserving
   * non-string values unchanged. It's useful for normalizing text in templates
   * and ensuring consistent case formatting.
   *
   * @param str - The string to convert to lowercase
   * @returns Lowercase string or original value if not a string
   *
   * @example source code
   * ```typescript
   * toLowerCase(str: string): string {
   *   return typeof str === 'string' ? str.toLowerCase() : str;
   * }
   * ```
   *
   * @example output
   * ```handlebars
   * hello world
   * ```
   * @example Basic Usage
   * ```handlebars
   * {{toLowerCase "HELLO WORLD"}}
   * <!-- Output: hello world -->
   * ```
   *
   * @example With Variables
   * ```handlebars
   * {{toLowerCase title}}
   * {{toLowerCase (concat firstName " " lastName)}}
   * ```
   *
   * @example Non-string Values
   * ```handlebars
   * {{toLowerCase 123}}
   * <!-- Output: 123 (unchanged) -->
   * ```
   */
  toLowerCase(str: string): string {
    return typeof str === 'string' ? str.toLowerCase() : str;
  },

  /**
   * Performs strict equality comparison between two values
   *
   * This helper compares two values using strict equality (`===`) and returns
   * a boolean result. It's commonly used in conditional statements within
   * templates to control content rendering based on value matches.
   *
   * @param a - First value to compare
   * @param b - Second value to compare
   * @returns `true` if values are strictly equal, `false` otherwise
   *
   * @example source code
   * ```typescript
   * eq(a: unknown, b: unknown): boolean {
   *   return a === b;
   * }
   * ```
   *
   * @example Basic Comparison
   * ```handlebars
   * {{#if (eq status "active")}}
   * Status is active
   * {{/if}}
   * ```
   *
   * @example With Numbers
   * ```handlebars
   * {{#if (eq count 0)}}
   * No items found
   * {{/if}}
   * ```
   *
   * @example With Variables
   * ```handlebars
   * {{#if (eq user.role "admin")}}
   * Admin panel
   * {{/if}}
   * ```
   */
  eq(a: unknown, b: unknown): boolean {
    return a === b;
  },

  /**
   * Performs logical OR operation on multiple values
   *
   * This helper evaluates multiple values and returns `true` if any value
   * is truthy. It automatically handles the Handlebars options object
   * that is passed as the last argument to all helpers.
   *
   * @param args - Variable number of arguments to evaluate
   * @returns `true` if any argument is truthy, `false` otherwise
   *
   * @example source code
   * ```typescript
   * or(...args: unknown[]): boolean {
   *   return args.some((value) => !!value);
   * }
   * ```
   *
   * @example Basic OR Operation
   * ```handlebars
   * {{#if (or hasTitle hasDescription)}}
   * Content is available
   * {{/if}}
   * ```
   *
   * @example Multiple Conditions
   * ```handlebars
   * {{#if (or isAdmin isModerator isOwner)}}
   * Administrative access
   * {{/if}}
   * ```
   *
   * @example With Nested Helpers
   * ```handlebars
   * {{#if (or (eq status "active") (eq status "pending"))}}
   * Valid status
   * {{/if}}
   * ```
   */
  or(...args: unknown[]): boolean {
    // Remove the last argument (Handlebars options object)
    const values = args.slice(0, -1);
    return values.some((value) => !!value);
  },

  /**
   * Repeats strings or content blocks multiple times
   *
   * This helper supports both regular and block helper syntax for repeating
   * content. It includes safety limits to prevent excessive repetition and
   * provides fallback implementations for environments without native `repeat`.
   *
   * Block Helper Syntax:
   * - Repeats the content between opening and closing tags
   * - Maximum repetition limit: 6 times
   * - Provides access to `@index` for iteration tracking
   *
   * Regular Helper Syntax:
   * - Repeats the provided string argument
   * - Maximum repetition limit: 6 times (with +3 offset)
   *
   * @param count - Number of times to repeat (limited to 6)
   * @param args - Additional arguments (string for regular helper, options for block helper)
   * @returns Repeated string or content
   *
   * @example source code
   * ```typescript
   * repeat(count: number, ...args: unknown[]): string {
   *   return Array(count + 1).join(args[0]);
   * }
   * ```
   *
   * @example Block Helper Usage
   * ```handlebars
   * {{#repeat 3}}
   * # Section {{add @index 1}}
   * Content for section {{add @index 1}}
   * {{/repeat}}
   * ```
   *
   * @example Regular Helper Usage
   * ```handlebars
   * {{repeat 3 "---"}}
   * <!-- Output: --------- -->
   * ```
   *
   * @example With Variables
   * ```handlebars
   * {{repeat separatorCount separator}}
   * {{#repeat itemCount}}
   * - {{item}}
   * {{/repeat}}
   * ```
   *
   * @example Safety Limits
   * ```handlebars
   * {{repeat 10 "x"}}
   * <!-- Output: xxxxxx (limited to 6) -->
   * ```
   */
  repeat(count: number, ...args: unknown[]): string {
    // For block helper syntax: {{#repeat count}}content{{/repeat}}
    const options = args[0] as Handlebars.HelperOptions;
    if (options && options.fn) {
      const content = options.fn(this);
      const repeatCount = Math.min(count || 0, 6);

      if (typeof content.repeat === 'function') {
        return content.repeat(repeatCount);
      } else {
        // Fallback implementation for older environments
        return Array(repeatCount + 1).join(content);
      }
    }

    // For regular helper syntax: {{repeat count str}}
    const str = args[0];
    const stringValue = String(str || '');
    const repeatCount = Math.min((count || 0) + 3, 6);

    if (typeof stringValue.repeat === 'function') {
      return stringValue.repeat(repeatCount);
    } else {
      // Fallback implementation for older environments
      return Array(repeatCount + 1).join(stringValue);
    }
  },

  /**
   * Performs addition on numeric values
   *
   * This helper adds two numeric values together. It's useful for
   * mathematical operations within templates, such as calculating
   * indices, offsets, or other numeric computations.
   *
   * @param a - First number to add
   * @param b - Second number to add
   * @returns Sum of the two numbers
   *
   * @example source code
   * ```typescript
   * add(a: number, b: number): number {
   *   return a + b;
   * }
   * ```
   *
   * @example Basic Addition
   * ```handlebars
   * {{add 5 3}}
   * <!-- Output: 8 -->
   * ```
   *
   * @example With Variables
   * ```handlebars
   * {{add @index 1}}
   * {{add offset 10}}
   * ```
   *
   * @example In Loops
   * ```handlebars
   * {{#each items}}
   * {{add @index 1}}. {{name}}
   * {{/each}}
   * ```
   *
   * @example With Nested Helpers
   * ```handlebars
   * {{add (length items) 1}}
   * {{add (multiply base 2) offset}}
   * ```
   */
  add(a: number, b: number): number {
    return a + b;
  },

  /**
   * Formats tag names by removing @ prefix and capitalizing first letter
   *
   * This helper processes tag names to create more readable output by:
   * 1. Removing the @ symbol if it's the first character
   * 2. Capitalizing the first letter of the remaining text
   *
   * @param tag - The tag string to format
   * @returns Formatted tag string with @ removed and first letter capitalized
   *
   * @example source code
   * ```typescript
   * formatTag(tag: string): string {
   *   if (typeof tag !== 'string') return tag;
   *   const cleanTag = tag.startsWith('@') ? tag.slice(1) : tag;
   *   return cleanTag.charAt(0).toUpperCase() + cleanTag.slice(1);
   * }
   * ```
   *
   * @example Basic Usage
   * ```handlebars
   * {{formatTag "@param"}}
   * <!-- Output: Param -->
   * ```
   *
   * @example Without @ Prefix
   * ```handlebars
   * {{formatTag "returns"}}
   * <!-- Output: Returns -->
   * ```
   *
   * @example With Variables
   * ```handlebars
   * {{formatTag tagName}}
   * {{formatTag (concat "@" tagType)}}
   * ```
   *
   * @example Non-string Values
   * ```handlebars
   * {{formatTag 123}}
   * <!-- Output: 123 (unchanged) -->
   * ```
   */
  formatTag(tag: string): string {
    if (typeof tag !== 'string') return tag;
    const cleanTag = tag.startsWith('@') ? tag.slice(1) : tag;
    return cleanTag.charAt(0).toUpperCase() + cleanTag.slice(1);
  }
};
