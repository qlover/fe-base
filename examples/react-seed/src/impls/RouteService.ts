import type {
  RouteConfigValue,
  RouteServiceInterface
} from '@/interfaces/RouteServiceInterface';

export class RouteService implements RouteServiceInterface {
  /**
   * @override
   */
  getRoutes(): RouteConfigValue[] {
    return [];
  }
}
