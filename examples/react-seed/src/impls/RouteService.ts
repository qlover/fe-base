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
import type { SliceStoreAdapter } from '@qlover/corekit-bridge';

const mainCategory: RouteCategory[] = ['main', 'general'];
const authCategory: RouteCategory[] = ['auth', 'general'];
export class RouteService implements RouteServiceInterface {
  protected defaultRoutes: RouteConfigValue[];
  protected store: AsyncStore<RouteServiceState, string>;
  private postSwitchNavigateTo: string | null = null;

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

  /**
   * Path queued during auth/main route switch; consumed by AppRouterProvider after
   * the new router mounts so navigation runs on the live router instance.
   */
  public consumePostSwitchNavigateTo(): string | null {
    const path = this.postSwitchNavigateTo;
    this.postSwitchNavigateTo = null;
    return path;
  }

  private switchActiveRoutes(
    activeRoutes: RouteConfigValue[],
    navigateTo?: string
  ): void {
    this.postSwitchNavigateTo = navigateTo ?? null;
    this.store.emit({ loading: true });
    queueMicrotask(() => {
      this.store.emit({ result: activeRoutes, loading: false });
    });
  }

  public useMainRoutes(navigateTo?: string): void {
    const activeRoutes = filterRouteByCategorys(
      this.defaultRoutes,
      mainCategory
    );
    this.switchActiveRoutes(activeRoutes, navigateTo);
  }

  public useAuthRoutes(navigateTo?: string): void {
    const activeRoutes = filterRouteByCategorys(
      this.defaultRoutes,
      authCategory
    );
    this.switchActiveRoutes(activeRoutes, navigateTo);
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
  public getUIStore(): SliceStoreAdapter<RouteServiceState> {
    return this.store.getStore() as SliceStoreAdapter<RouteServiceState>;
  }

  /**
   * @override
   */
  public getRoutes(): RouteConfigValue[] {
    return usePathLocaleRoute ? baseRoutesWithLocale : baseRoutes;
  }
}
