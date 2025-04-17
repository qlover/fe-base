/**
 * Represents a parameter interface for options methods
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

export type ExampleOptionsType = {
  eoptType1: string;
  eoptType2: boolean;
};

/**
 * This is a example class
 * summary line1
 * summary line2
 * - Only use for test
 * - summary line3
 *
 * @description Only Description
 * @class
 * @example example1
 * ```typescript
 * const example = new ExampleClass({
 *   name: 'example1',
 *   debug: true
 * })
 * ```
 * @example example2
 *
 * this is example 2
 * ```typescript
 * const example = new ExampleClass({
 *   name: 'example2',
 *   debug: true
 * })
 * ```
 *
 */
export class ExampleClass {
  /**
   * The name identifier for the class instance
   *
   * @purpose Uniquely identifies each class instance
   * @core Stores the instance name as a string
   * @functionality Provides a way to identify and reference specific instances
   * @usage Used throughout the class methods for identification
   * @example
   * ```typescript
   * const instance = new ExampleClass({ name: "myInstance" });
   * console.log(instance.name); // "myInstance"
   * ```
   */
  public name: string;
  /**
   * Debug flag to control logging and debugging features
   *
   * @purpose Controls debug behavior of the class
   * @core Toggles debug functionality on/off
   * @functionality Enables or disables debug features and logging
   * @usage Set during instantiation to control debug behavior
   * @example
   * ```typescript
   * const instance = new ExampleClass({
   *   name: "test",
   *   debug: true
   * });
   * ```
   */
  public debug: boolean = false;

  constructor(options: {
    /**
     * @description Example name
     * @default `''`
     * @type {string}
     */
    name: string;
    /**
     * has debug?
     * @description Example debug
     * @default `false`
     * @since 1.0.0
     * @type {boolean}
     */
    debug: boolean;

    /**
     * extra params
     * @description Example extra
     * @type {Record<string, unknown>}
     * @default `{}`
     * @deprecated
     */
    extra?: Record<string, unknown>;
  }) {
    this.name = options.name;
    this.debug = options.debug;
  }

  /**
   * ExampleMethod title
   * @description Example method description
   * @param {string} name Example param name
   * @returns {string} Example return name
   */
  exampleMethod(name: string): string {
    return name;
  }

  /**
   * public ExampleMethod title
   * @description public Example method description
   * @example public ExampleMethod example
   * ```typescript
   * const example = new ExampleClass({
   *   name: 'example3',
   *   debug: true
   * })
   * example.publicExampleMethod('example', 'publicParam')
   * ```
   * @example
   * public ExampleMethod example2
   *
   * this is example 2
   * ```typescript
   * const example = new ExampleClass({
   *   name: 'example3',
   *   debug: true
   * })
   * example.publicExampleMethod('example2', 'publicParam2')
   * ```
   * @param {string} name Example param name
   * @param {string} publicParam Example param publicParam
   * @returns {string} Example return name + publicParam
   */
  public publicExampleMethod(name: string, publicParam: string): string {
    return name + publicParam;
  }

  /**
   * private ExampleMethod title
   * @description private Example method description
   * @example private ExampleMethod example
   * ```typescript
   * const example = new ExampleClass({
   *   name: 'example3',
   *   debug: true
   * })
   * example.privateExampleMethod('example', 'privateParam')
   * ```
   * @example private ExampleMethod example2
   * this is example 2
   * ```typescript
   * const example = new ExampleClass({
   *   name: 'example3',
   *   debug: true
   * })
   * example.privateExampleMethod('example2', 'privateParam2')
   * ```
   * @param {string} name Example param name
   * @param {string} privateParam Example param privateParam
   * @returns {string} Example return name + privateParam
   */
  // @ts-expect-error
  private privateExampleMethod(name: string, privateParam: string): string {
    return name + privateParam;
  }

  /**
   * Processes options with typed parameters
   *
   * @purpose Demonstrates handling of typed option parameters
   * @core Processes OptionsMethosParams in a type-safe way
   * @functionality Handles options with string and boolean parameters
   * @usage Called when processing configuration options
   * @example
   * ```typescript
   * const instance = new ExampleClass({ name: "test" });
   * instance.optionsMethods({
   *   optArgs1: "value",
   *   optArgs2: true
   * });
   * ```
   * @param options options description
   */
  // @ts-expect-error
  // eslint-disable-next-line
  optionsMethods(options: ExampleOptionsInterface): void {}
}
