import { RouteService } from '@/impls/RouteService';
import { UserService } from '@/impls/UserService';
import { userRoutePlugin } from '@/utils/userRoutePlugin';

describe('userRoutePlugin', () => {
  const mockLogger = {
    debug: vi.fn()
  };

  it('should have pluginName and onBefore', () => {
    expect(userRoutePlugin.pluginName).toBe('userRoute');
    expect(userRoutePlugin.onBefore).toBeDefined();
    expect(typeof userRoutePlugin.onBefore).toBe('function');
  });

  it('should call useMainRoutes and log success when refreshUser resolves true', async () => {
    const routeService = {
      useMainRoutes: vi.fn(),
      useAuthRoutes: vi.fn()
    };
    const userService = {
      refreshUser: vi.fn().mockResolvedValue(true)
    };
    const mockIoc = {
      get: vi.fn().mockImplementation((cls: unknown) => {
        if (cls === UserService) return userService;
        if (cls === RouteService) return routeService;
        return undefined;
      })
    };

    userRoutePlugin.onBefore!({
      parameters: {
        ioc: mockIoc as never,
        logger: mockLogger as never,
        root: undefined
      }
    } as never);

    expect(mockIoc.get).toHaveBeenCalledWith(UserService);
    expect(userService.refreshUser).toHaveBeenCalledTimes(1);

    await vi.waitFor(() => {
      expect(mockIoc.get).toHaveBeenCalledWith(RouteService);
      expect(routeService.useMainRoutes).toHaveBeenCalledTimes(1);
    });
    expect(routeService.useAuthRoutes).not.toHaveBeenCalled();
    expect(mockLogger.debug).toHaveBeenCalledWith('userRoute success!');
  });

  it('should call useAuthRoutes and log fail when refreshUser resolves false', async () => {
    const routeService = {
      useMainRoutes: vi.fn(),
      useAuthRoutes: vi.fn()
    };
    const userService = {
      refreshUser: vi.fn().mockResolvedValue(false)
    };
    const mockIoc = {
      get: vi.fn().mockImplementation((cls: unknown) => {
        if (cls === UserService) return userService;
        if (cls === RouteService) return routeService;
        return undefined;
      })
    };

    userRoutePlugin.onBefore!({
      parameters: {
        ioc: mockIoc as never,
        logger: mockLogger as never,
        root: undefined
      }
    } as never);

    await vi.waitFor(() => {
      expect(routeService.useAuthRoutes).toHaveBeenCalledTimes(1);
    });
    expect(routeService.useMainRoutes).not.toHaveBeenCalled();
    expect(mockLogger.debug).toHaveBeenCalledWith('userRoute fail!');
  });

  it('should call useAuthRoutes and log error when refreshUser rejects', async () => {
    const routeService = {
      useMainRoutes: vi.fn(),
      useAuthRoutes: vi.fn()
    };
    const error = new Error('Network error');
    const userService = {
      refreshUser: vi.fn().mockRejectedValue(error)
    };
    const mockIoc = {
      get: vi.fn().mockImplementation((cls: unknown) => {
        if (cls === UserService) return userService;
        if (cls === RouteService) return routeService;
        return undefined;
      })
    };

    userRoutePlugin.onBefore!({
      parameters: {
        ioc: mockIoc as never,
        logger: mockLogger as never,
        root: undefined
      }
    } as never);

    await vi.waitFor(() => {
      expect(routeService.useAuthRoutes).toHaveBeenCalledTimes(1);
    });
    expect(routeService.useMainRoutes).not.toHaveBeenCalled();
    expect(mockLogger.debug).toHaveBeenCalledWith('userRoute error!', error);
  });
});
