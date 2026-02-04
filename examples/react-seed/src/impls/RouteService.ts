import type { RouteConfigValue } from '@/interfaces/RouteLoaderInterface';
import type { RouteServiceInterface } from '@/interfaces/RouteServiceInterface';

export class RouteService implements RouteServiceInterface {
  /**
   * @override
   */
  public getRoutes(): RouteConfigValue[] {
    return [];
  }
}
