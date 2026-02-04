import type {
  RouteConfigValue,
  RouteServiceInterface
} from '@/interfaces/RouteServiceInterface';

export class RouteService implements RouteServiceInterface {
  /**
   * @override
   */
  public getRoutes(): RouteConfigValue[] {
    return [];
  }
}
