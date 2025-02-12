import { IOCInterface } from '@/base/port/IOCInterface';
import { RegisterApi } from './RegisterApi';
import { RegisterControllers } from './RegisterControllers';
import { RegisterCommon } from './RegisterCommon';

export class FeIOC implements IOCInterface {
  private container: Map<string, unknown> = new Map();

  /**
   * order:
   * 1. RegisterCommon
   * 2. RegisterApi
   * 3. RegisterControllers
   */
  configure(): void {
    new RegisterCommon().register(this);
    new RegisterApi().register(this);
    new RegisterControllers().register(this);
  }

  bind<T>(key: string, value: T): void {
    this.container.set(key, value);
  }

  get<T>(key: string): T {
    return this.container.get(key) as T;
  }

  override<T>(key: string, value: T): void {
    this.bind(key, value);
  }
}
