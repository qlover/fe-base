import { RouteService } from '@/impls/RouteService';
import { filterRouteByCategorys } from '@/utils/filterAppRoute';
import type { RouteConfigValue } from '@/interfaces/RouteLoaderInterface';

const { mockBaseRoutes, mockBaseRoutesWithLocale } = vi.hoisted(() => {
  const base: RouteConfigValue[] = [
    { path: '/', category: 'main', element: 'Layout' },
    { path: '/login', category: 'auth', element: 'Login' },
    { path: '404', category: 'general', element: '404' },
    { path: '*', category: 'general', element: '404' }
  ];
  const withLocale: RouteConfigValue[] = [
    { path: '/:lng', category: 'general', element: 'Layout' },
    { path: '404', category: 'general', element: '404' }
  ];
  return { mockBaseRoutes: base, mockBaseRoutesWithLocale: withLocale };
});

vi.mock('@config/router', () => ({
  baseRoutes: mockBaseRoutes,
  baseRoutesWithLocale: mockBaseRoutesWithLocale
}));

vi.mock('@config/seed.config', () => ({
  usePathLocaleRoute: false
}));

describe('RouteService', () => {
  let service: RouteService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new RouteService();
  });

  describe('constructor', () => {
    it('should create store with loading true and result filtered by general', () => {
      const store = service.getStore();
      const state = store.getState();

      expect(state.loading).toBe(true);
      const generalOnly = filterRouteByCategorys(mockBaseRoutes, 'general');
      expect(state.result).toEqual(generalOnly);
    });
  });

  describe('getStore', () => {
    it('should return the same store instance', () => {
      expect(service.getStore()).toBe(service.getStore());
    });
  });

  describe('getRoutes', () => {
    it('should return default routes (baseRoutes when usePathLocaleRoute is false)', () => {
      const routes = service.getRoutes();
      expect(routes).toEqual(mockBaseRoutes);
    });
  });

  describe('useMainRoutes', () => {
    it('should update store with main+general routes and set loading false', () => {
      service.useMainRoutes();

      const state = service.getStore().getState();
      expect(state.loading).toBe(false);
      const expected = filterRouteByCategorys(mockBaseRoutes, [
        'main',
        'general'
      ]);
      expect(state.result).toEqual(expected);
    });
  });

  describe('useAuthRoutes', () => {
    it('should update store with auth+general routes and set loading false', () => {
      service.useAuthRoutes();

      const state = service.getStore().getState();
      expect(state.loading).toBe(false);
      const expected = filterRouteByCategorys(mockBaseRoutes, [
        'auth',
        'general'
      ]);
      expect(state.result).toEqual(expected);
    });
  });

  describe('switching routes', () => {
    it('should allow switching from main to auth routes', () => {
      service.useMainRoutes();
      let state = service.getStore().getState();
      expect(state.result).toEqual(
        filterRouteByCategorys(mockBaseRoutes, ['main', 'general'])
      );

      service.useAuthRoutes();
      state = service.getStore().getState();
      expect(state.result).toEqual(
        filterRouteByCategorys(mockBaseRoutes, ['auth', 'general'])
      );
    });
  });
});
