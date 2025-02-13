/**
 * Need to be used in the UI component
 *
 * eg. A service use window.localStorage, it should be like this:
 *
 */
export interface UIDependenciesInterface<Dep = unknown> {
  /**
   * Represents the dependencies required by the UI component.
   *
   * @type {Dep}
   * @description This allows for partial updates to the dependencies if `Dep` is an object, enabling flexibility in dependency management.
   *
   * @example
   * const uiDependencies: UIDependenciesInterface<{ api: string, token: string }> = {
   *   dependencies: { api: 'https://api.example.com' }
   * };
   *
   * const simpleDependencies: UIDependenciesInterface<string> = {
   *   dependencies: 'simple-dependency'
   * };
   */
  dependencies?: Dep;

  /**
   * Sets the dependencies for the UI component.
   *
   * @param {Dep} dependencies - The dependencies to be set, allowing partial updates if `Dep` is an object.
   * @description This method allows updating the dependencies, supporting partial updates if `Dep` is an object.
   *
   * @example
   * uiDependencies.setDependencies({ token: 'new-token' });
   *
   * simpleDependencies.setDependencies('new-simple-dependency');
   */
  setDependencies(dependencies: Dep): void;
}
