import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UserService } from '../../src/core/gateway-auth/impl/UserService';
import { LoginService } from '../../src/core/gateway-auth/impl/LoginService';
import { RegisterService } from '../../src/core/gateway-auth/impl/RegisterService';
import { UserInfoService } from '../../src/core/gateway-auth/impl/UserInfoService';
import { AsyncStore } from '../../src/core/store-state';
import type {
  LoginInterface,
  LoginParams
} from '../../src/core/gateway-auth/interface/LoginInterface';
import type { RegisterInterface } from '../../src/core/gateway-auth/interface/RegisterInterface';
import type { UserInfoInterface } from '../../src/core/gateway-auth/interface/UserInfoInterface';
import { GatewayBasePlguin } from '../../src/core/gateway-auth/impl/GatewayBasePlguin';
import type { LoggerInterface } from '@qlover/logger';
import { LogContext } from '@qlover/logger';

interface TestCredential {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

interface TestUser {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface RegisterParams {
  email?: string;
  phone?: string;
  password: string;
  code?: string;
}

class MockUserServiceGateway
  implements
    LoginInterface<TestCredential>,
    RegisterInterface<TestUser>,
    UserInfoInterface<TestUser>
{
  login = vi.fn<() => Promise<TestCredential | null>>();
  logout = vi.fn();
  register = vi.fn<() => Promise<TestUser | null>>();
  getUserInfo = vi.fn<() => Promise<TestUser | null>>();
  refreshUserInfo = vi.fn<() => Promise<TestUser | null>>();
}

class MockLogger implements LoggerInterface {
  log = vi.fn();
  fatal = vi.fn();
  trace = vi.fn();
  debug = vi.fn();
  info = vi.fn();
  warn = vi.fn();
  error = vi.fn();
  addAppender = vi.fn();
  context<Value>(value?: Value): LogContext<Value> {
    return new LogContext<Value>(value);
  }
}

describe('UserService', () => {
  let userService: UserService<TestCredential, TestUser>;
  let loginService: LoginService<
    TestCredential,
    AsyncStore<TestCredential, string>
  >;
  let registerService: RegisterService<TestUser>;
  let userInfoService: UserInfoService<TestUser, AsyncStore<TestUser, string>>;
  let mockGateway: MockUserServiceGateway;
  let mockLogger: MockLogger;

  beforeEach(() => {
    mockGateway = new MockUserServiceGateway();
    mockLogger = new MockLogger();

    loginService = new LoginService<
      TestCredential,
      AsyncStore<TestCredential, string>
    >('LoginService', {
      gateway: mockGateway,
      logger: mockLogger,
      defaultState: () => null
    });
    loginService.use(
      new GatewayBasePlguin<
        unknown,
        TestCredential,
        LoginInterface<TestCredential>
      >()
    );

    registerService = new RegisterService<TestUser>('RegisterService', {
      gateway: mockGateway,
      logger: mockLogger,
      defaultState: () => null
    });
    registerService.use(
      new GatewayBasePlguin<unknown, TestUser, RegisterInterface<TestUser>>()
    );

    userInfoService = new UserInfoService<
      TestUser,
      AsyncStore<TestUser, string>
    >('UserInfoService', {
      gateway: mockGateway,
      logger: mockLogger,
      defaultState: () => null
    });
    userInfoService.use(
      new GatewayBasePlguin<unknown, TestUser, UserInfoInterface<TestUser>>()
    );

    userService = new UserService<TestCredential, TestUser>(
      'UserService',
      loginService,
      userInfoService,
      registerService,
      {
        gateway: mockGateway,
        logger: mockLogger,
        defaultState: () => null
      }
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create service with service name', () => {
      const service = new UserService<TestCredential, TestUser>(
        'TestUserService',
        loginService,
        userInfoService,
        registerService
      );
      expect(service.serviceName).toBe('TestUserService');
    });

    it('should create service with gateway', () => {
      const service = new UserService<TestCredential, TestUser>(
        'TestUserService',
        loginService,
        userInfoService,
        registerService,
        {
          gateway: mockGateway,
          defaultState: () => null
        }
      );
      expect(service.getGateway()).toBe(mockGateway);
    });

    it('should create service without gateway', () => {
      const service = new UserService<TestCredential, TestUser>(
        'TestUserService',
        loginService,
        userInfoService,
        registerService
      );
      expect(service.getGateway()).toBeNull();
    });
  });

  describe('getStore', () => {
    it('should return credential store from login service', () => {
      const store = userService.getStore();
      expect(store).toBeDefined();
      expect(store).toBeInstanceOf(AsyncStore);
      expect(store).toBe(loginService.getStore());
    });
  });

  describe('getUserInfoStore', () => {
    it('should return user info store from userInfo service', () => {
      const store = userService.getUserInfoStore();
      expect(store).toBeDefined();
      expect(store).toBeInstanceOf(AsyncStore);
      expect(store).toBe(userInfoService.getStore());
    });
  });

  describe('getUser', () => {
    it('should return null when no user', () => {
      const user = userService.getUser();
      expect(user).toBeNull();
    });

    it('should return user from userInfo service', async () => {
      const testUser: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockGateway.getUserInfo.mockResolvedValue(testUser);

      await userService.getUserInfo(undefined);

      const user = userService.getUser();
      expect(user).toEqual(testUser);
    });
  });

  describe('login', () => {
    it('should delegate to loginService', async () => {
      const testCredential: TestCredential = {
        token: 'test-token-123',
        refreshToken: 'refresh-token-456',
        expiresIn: 3600
      };

      mockGateway.login.mockResolvedValue(testCredential);

      const params: LoginParams = {
        email: 'user@example.com',
        password: 'password123'
      };

      const result = await userService.login(params);

      expect(mockGateway.login).toHaveBeenCalledWith(params);
      expect(result).toEqual(testCredential);
      expect(userService.getStore().getResult()).toEqual(testCredential);
    });

    it('should update credential store', async () => {
      const testCredential: TestCredential = {
        token: 'test-token-123',
        refreshToken: 'refresh-token-456',
        expiresIn: 3600
      };

      mockGateway.login.mockResolvedValue(testCredential);

      await userService.login({
        email: 'user@example.com',
        password: 'password123'
      });

      const credentialStore = userService.getStore();
      expect(credentialStore.getResult()).toEqual(testCredential);
    });
  });

  describe('logout', () => {
    it('should delegate to loginService', async () => {
      mockGateway.logout.mockResolvedValue(undefined);

      await userService.logout();

      expect(mockGateway.logout).toHaveBeenCalledTimes(1);
    });

    it('should reset credential store', async () => {
      const testCredential: TestCredential = {
        token: 'test-token-123',
        refreshToken: 'refresh-token-456',
        expiresIn: 3600
      };

      mockGateway.login.mockResolvedValue(testCredential);
      mockGateway.logout.mockResolvedValue(undefined);

      await userService.login({
        email: 'user@example.com',
        password: 'password123'
      });

      const credentialStore = userService.getStore();
      expect(credentialStore.getResult()).toEqual(testCredential);

      await userService.logout();

      expect(credentialStore.getResult()).toBeNull();
    });
  });

  describe('register', () => {
    it('should delegate to registerService', async () => {
      const testUser: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockGateway.register.mockResolvedValue(testUser);

      const params: RegisterParams = {
        email: 'john@example.com',
        password: 'password123',
        code: '123456'
      };

      const result = await userService.register(params);

      expect(mockGateway.register).toHaveBeenCalledWith(params);
      expect(result).toEqual(testUser);
    });
  });

  describe('getUserInfo', () => {
    it('should delegate to userInfoService', async () => {
      const testUser: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockGateway.getUserInfo.mockResolvedValue(testUser);

      const result = await userService.getUserInfo(undefined);

      expect(mockGateway.getUserInfo).toHaveBeenCalledTimes(1);
      expect(result).toEqual(testUser);
      expect(userService.getUser()).toEqual(testUser);
    });

    it('should update user info store', async () => {
      const testUser: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockGateway.getUserInfo.mockResolvedValue(testUser);

      await userService.getUserInfo(undefined);

      const userInfoStore = userService.getUserInfoStore();
      expect(userInfoStore.getResult()).toEqual(testUser);
    });
  });

  describe('refreshUserInfo', () => {
    it('should delegate to userInfoService', async () => {
      const testUser: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockGateway.refreshUserInfo.mockResolvedValue(testUser);

      const result = await userService.refreshUserInfo(undefined);

      expect(mockGateway.refreshUserInfo).toHaveBeenCalledTimes(1);
      expect(result).toEqual(testUser);
    });

    it('should update user info store', async () => {
      const testUser: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockGateway.refreshUserInfo.mockResolvedValue(testUser);

      await userService.refreshUserInfo(undefined);

      const userInfoStore = userService.getUserInfoStore();
      expect(userInfoStore.getResult()).toEqual(testUser);
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no credential and no user', () => {
      expect(userService.isAuthenticated()).toBe(false);
    });

    it('should return false when only credential exists', async () => {
      const testCredential: TestCredential = {
        token: 'test-token-123',
        refreshToken: 'refresh-token-456',
        expiresIn: 3600
      };

      mockGateway.login.mockResolvedValue(testCredential);

      await userService.login({
        email: 'user@example.com',
        password: 'password123'
      });

      expect(userService.isAuthenticated()).toBe(false);
    });

    it('should return false when only user exists', async () => {
      const testUser: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockGateway.getUserInfo.mockResolvedValue(testUser);

      await userService.getUserInfo(undefined);

      expect(userService.isAuthenticated()).toBe(false);
    });

    it('should return true when both credential and user exist', async () => {
      const testCredential: TestCredential = {
        token: 'test-token-123',
        refreshToken: 'refresh-token-456',
        expiresIn: 3600
      };

      const testUser: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockGateway.login.mockResolvedValue(testCredential);
      mockGateway.getUserInfo.mockResolvedValue(testUser);

      await userService.login({
        email: 'user@example.com',
        password: 'password123'
      });

      await userService.getUserInfo(undefined);

      expect(userService.isAuthenticated()).toBe(true);
    });

    it('should return false after logout', async () => {
      const testCredential: TestCredential = {
        token: 'test-token-123',
        refreshToken: 'refresh-token-456',
        expiresIn: 3600
      };

      const testUser: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockGateway.login.mockResolvedValue(testCredential);
      mockGateway.getUserInfo.mockResolvedValue(testUser);
      mockGateway.logout.mockResolvedValue(undefined);

      await userService.login({
        email: 'user@example.com',
        password: 'password123'
      });

      await userService.getUserInfo(undefined);

      expect(userService.isAuthenticated()).toBe(true);

      await userService.logout();

      expect(userService.isAuthenticated()).toBe(false);
    });
  });

  describe('use', () => {
    it('should register plugin with user service', () => {
      const plugin = {
        pluginName: 'TestPlugin',
        onLoginBefore: vi.fn()
      } as unknown as Parameters<typeof userService.use>[0];

      const result = userService.use(plugin);
      expect(result).toBe(userService);
    });

    it('should register multiple plugins', () => {
      const plugin1 = {
        pluginName: 'Plugin1',
        onLoginBefore: vi.fn()
      } as unknown as Parameters<typeof userService.use>[0];

      const plugin2 = {
        pluginName: 'Plugin2',
        onRegisterSuccess: vi.fn()
      } as unknown as Parameters<typeof userService.use>[0];

      const result = userService.use([plugin1, plugin2] as Parameters<
        typeof userService.use
      >[0]);
      expect(result).toBe(userService);
    });
  });

  describe('integration', () => {
    it('should handle complete login and getUserInfo flow', async () => {
      const testCredential: TestCredential = {
        token: 'test-token-123',
        refreshToken: 'refresh-token-456',
        expiresIn: 3600
      };

      const testUser: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockGateway.login.mockResolvedValue(testCredential);
      mockGateway.getUserInfo.mockResolvedValue(testUser);

      // Login
      const credential = await userService.login({
        email: 'user@example.com',
        password: 'password123'
      });

      expect(credential).toEqual(testCredential);
      expect(userService.getStore().getResult()).toEqual(testCredential);
      expect(userService.isAuthenticated()).toBe(false); // No user yet

      // Get user info
      const user = await userService.getUserInfo(undefined);

      expect(user).toEqual(testUser);
      expect(userService.getUser()).toEqual(testUser);
      expect(userService.getUserInfoStore().getResult()).toEqual(testUser);
      expect(userService.isAuthenticated()).toBe(true); // Both credential and user exist
    });

    it('should handle complete register flow', async () => {
      const testUser: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockGateway.register.mockResolvedValue(testUser);

      const user = await userService.register({
        email: 'john@example.com',
        password: 'password123',
        code: '123456'
      });

      expect(user).toEqual(testUser);
    });

    it('should handle complete logout flow', async () => {
      const testCredential: TestCredential = {
        token: 'test-token-123',
        refreshToken: 'refresh-token-456',
        expiresIn: 3600
      };

      const testUser: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockGateway.login.mockResolvedValue(testCredential);
      mockGateway.getUserInfo.mockResolvedValue(testUser);
      mockGateway.logout.mockResolvedValue(undefined);

      await userService.login({
        email: 'user@example.com',
        password: 'password123'
      });

      await userService.getUserInfo(undefined);

      expect(userService.isAuthenticated()).toBe(true);

      await userService.logout();

      expect(userService.isAuthenticated()).toBe(false);
      expect(userService.getStore().getResult()).toBeNull();
      // User info store is not reset by logout
      expect(userService.getUserInfoStore().getResult()).toEqual(testUser);
    });

    it('should handle refreshUserInfo flow', async () => {
      const initialUser: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      const refreshedUser: TestUser = {
        id: 1,
        name: 'John Updated',
        email: 'john.updated@example.com',
        avatar: 'https://example.com/avatar.jpg'
      };

      mockGateway.getUserInfo.mockResolvedValue(initialUser);
      mockGateway.refreshUserInfo.mockResolvedValue(refreshedUser);

      await userService.getUserInfo(undefined);
      expect(userService.getUser()).toEqual(initialUser);

      await userService.refreshUserInfo(undefined);
      expect(userService.getUser()).toEqual(refreshedUser);
    });
  });
});
