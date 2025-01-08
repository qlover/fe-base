import { UIDependenciesInterface } from '@/types/UIDependenciesInterface';
import { NavigateFunction, NavigateOptions } from 'react-router-dom';

export type RouterControllerDependencies = {
  location: globalThis.Location;
  navigate: NavigateFunction;
};

export class RouterController
  implements UIDependenciesInterface<RouterControllerDependencies>
{
  /**
   * @override
   */
  dependencies?: RouterControllerDependencies;

  constructor() {}

  /**
   * @override
   */
  setDependencies(dependencies: Partial<RouterControllerDependencies>): void {
    this.dependencies = Object.assign(
      this.dependencies || {},
      dependencies
    ) as RouterControllerDependencies;
  }

  goto(path: string, options?: NavigateOptions): void {
    this.dependencies?.navigate(path, options);
  }

  gotoLogin(): void {
    this.goto('/login', { replace: true });
  }
}
