import { baseRoutes, baseRoutesWithLocale } from '@config/router';
import { usePathLocaleRoute } from '@config/seed.config';
import { AsyncStore, AsyncStoreState } from '@qlover/corekit-bridge';
import { filterRouteByCategorys } from '@/utils/filterAppRoute';
import type {
  RouteCategory,
  RouteConfigValue
} from '@/interfaces/RouteLoaderInterface';
import type {
  RouteServiceInterface,
  RouteServiceState
} from '@/interfaces/RouteServiceInterface';

const mainCategory: RouteCategory[] = ['main', 'general'];
const authCategory: RouteCategory[] = ['auth', 'general'];
export class RouteService implements RouteServiceInterface {
  protected defaultRoutes: RouteConfigValue[];
  protected store: AsyncStore<RouteServiceState, string>;

  constructor() {
    this.defaultRoutes = usePathLocaleRoute ? baseRoutesWithLocale : baseRoutes;
    this.store = new AsyncStore<RouteServiceState, string>({
      defaultState: () =>
        new AsyncStoreState({
          // 如果需要使用动态路由那么就设置loading为true，同时只渲染general路由
          loading: true,
          result: filterRouteByCategorys(this.defaultRoutes, 'general')
          // 如果不需要动态路由则直接设置 defaultRoutes
          // result: this.defaultRoutes
        })
    });
  }

  public useMainRoutes(): void {
    const routes = this.defaultRoutes;
    const activeRoutes = filterRouteByCategorys(routes, mainCategory);
    this.store.emit({ result: activeRoutes, loading: false });
  }

  public useAuthRoutes(): void {
    const routes = this.defaultRoutes;
    const activeRoutes = filterRouteByCategorys(routes, authCategory);
    this.store.emit({ result: activeRoutes, loading: false });
  }

  /**
   * @override
   */
  public getStore(): AsyncStore<RouteServiceState, string> {
    return this.store;
  }

  /**
   * @override
   */
  public getRoutes(): RouteConfigValue[] {
    return usePathLocaleRoute ? baseRoutesWithLocale : baseRoutes;
  }
}
