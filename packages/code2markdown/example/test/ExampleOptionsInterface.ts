/**
 * Represents a parameter interface for options methods
 *
 * - this is a example options interface summary
 * - this is a example options interface summary2
 * - this is a example options interface summary3
 *
 * @purpose Provides a type-safe structure for passing options to methods
 * @core Defines a contract for option parameters with string and boolean values
 * @functionality Type definition for method parameters
 * @usage Used as a parameter type in ExampleClass.optionsMethods
 * @example
 * ```typescript
 * const options: OptionsMethosParams = {
 *   optArgs1: "some string",
 *   optArgs2: true
 * };
 * ```
 *
 * @example
 * this is example 2
 *
 * ```typescript
 * const options: OptionsMethosParams = {
 *   optArgs1: "some string",
 *   optArgs2: true
 * };
 * ```
 */
export interface ExampleOptionsInterface {
  /**
   * @description optArgs1 description
   * @type {string}
   */
  optArgs1: string;
  /**
   * @description optArgs2 description
   * @type {boolean}
   */
  optArgs2: boolean;

  /**
   * @description overloadMethod description
   * @param {string} name
   * @returns {Record<string, unknown>}
   */
  overloadMethod?(name: string): Record<string, unknown>;

  /**
   * @description overloadMethod description
   * @param {number} name
   * @returns {Record<number, unknown>}
   */
  overloadMethod?(name: number): Record<number, unknown>;
}
