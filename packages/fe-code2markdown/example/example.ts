export type OptionsMethosParams = {
  optArgs1: string;
  optArgs2: boolean;
};
/**
 * This is a example class
 *
 * Only use for test
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
  public name: string;

  constructor(options: {
    /**
     * @description Example name
     * @default ''
     * @type {string}
     */
    name: string;
    /**
     * has debug?
     * @description Example debug
     * @default false
     * @since 1.0.0
     * @type {boolean}
     */
    debug: boolean;

    /**
     * extra params
     * @description Example extra
     * @type {Record<string, any>}
     * @deprecated
     */
    extra?: Record<string, any>;
  }) {
    this.name = options.name;
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
   * @example public ExampleMethod example2
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
  private privateExampleMethod(name: string, privateParam: string): string {
    return name + privateParam;
  }

  /**
   * optionsMethods description
   * @param {OptionsMethosParams} options options description
   */
  optionsMethods(options: OptionsMethosParams): void {}
}
