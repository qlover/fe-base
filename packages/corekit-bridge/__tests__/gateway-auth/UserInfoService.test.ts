import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UserInfoService } from '../../src/core/gateway-auth/impl/UserInfoService';
import { AsyncStore } from '../../src/core/store-state';
import type { UserInfoInterface } from '../../src/core/gateway-auth/interface/UserInfoInterface';
import { GatewayBasePlguin } from '../../src/core/gateway-auth/impl/GatewayBasePlguin';
import { ExecutorError } from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';
import { LogContext } from '@qlover/logger';

interface TestUser {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface GetUserInfoParams {
  token?: string;
  userId?: number;
}

interface RefreshUserInfoParams {
  force?: boolean;
  token?: string;
}

class MockUserInfoGateway implements UserInfoInterface<TestUser> {
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

describe('UserInfoService', () => {
  let userInfoService: UserInfoService<TestUser, AsyncStore<TestUser, string>>;
  let mockGateway: MockUserInfoGateway;
  let mockLogger: MockLogger;

  beforeEach(() => {
    mockGateway = new MockUserInfoGateway();
    mockLogger = new MockLogger();
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
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create service with service name', () => {
      const service = new UserInfoService<
        TestUser,
        AsyncStore<TestUser, string>
      >('TestUserInfoService', {
        defaultState: () => null
      });
      expect(service.serviceName).toBe('TestUserInfoService');
    });

    it('should create service with gateway', () => {
      const service = new UserInfoService<
        TestUser,
        AsyncStore<TestUser, string>
      >('TestUserInfoService', {
        gateway: mockGateway,
        defaultState: () => null
      });
      expect(service.getGateway()).toBe(mockGateway);
    });

    it('should create service without gateway', () => {
      const service = new UserInfoService<
        TestUser,
        AsyncStore<TestUser, string>
      >('TestUserInfoService', {
        defaultState: () => null
      });
      expect(service.getGateway()).toBeNull();
    });

    it('should create store instance', () => {
      const store = userInfoService.getStore();
      expect(store).toBeDefined();
      expect(store).toBeInstanceOf(AsyncStore);
    });
  });

  describe('getUser', () => {
    it('should return null when no user', () => {
      const user = userInfoService.getUser();
      expect(user).toBeNull();
    });

    it('should return user from store', async () => {
      const testUser: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockGateway.getUserInfo.mockResolvedValue(testUser);

      await userInfoService.getUserInfo();

      const user = userInfoService.getUser();
      expect(user).toEqual(testUser);
    });

    it('should return null after failed fetch', async () => {
      const error = new Error('Failed to fetch user info');
      mockGateway.getUserInfo.mockRejectedValue(error);

      await expect(userInfoService.getUserInfo()).rejects.toThrow(
        'Failed to fetch user info'
      );

      const user = userInfoService.getUser();
      // When failed, result may be undefined or null
      expect(user === null || user === undefined).toBe(true);
    });
  });

  describe('getUserInfo', () => {
    it('should get user info without parameters', async () => {
      const testUser: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockGateway.getUserInfo.mockResolvedValue(testUser);

      const result = await userInfoService.getUserInfo();

      expect(mockGateway.getUserInfo).toHaveBeenCalledTimes(1);
      expect(mockGateway.getUserInfo).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(testUser);
      expect(userInfoService.getUser()).toEqual(testUser);
    });

    it('should get user info with parameters', async () => {
      const testUser: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      const params: GetUserInfoParams = {
        token: 'test-token-123'
      };

      mockGateway.getUserInfo.mockResolvedValue(testUser);

      const result = await userInfoService.getUserInfo(params);

      expect(mockGateway.getUserInfo).toHaveBeenCalledWith(params);
      expect(result).toEqual(testUser);
    });

    it('should get user info with userId parameter', async () => {
      const testUser: TestUser = {
        id: 2,
        name: 'Jane Doe',
        email: 'jane@example.com'
      };

      const params: GetUserInfoParams = {
        userId: 2
      };

      mockGateway.getUserInfo.mockResolvedValue(testUser);

      const result = await userInfoService.getUserInfo(params);

      expect(mockGateway.getUserInfo).toHaveBeenCalledWith(params);
      expect(result).toEqual(testUser);
    });

    it('should update store state during getUserInfo', async () => {
      const testUser: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockGateway.getUserInfo.mockResolvedValue(testUser);
      const store = userInfoService.getStore();

      expect(store.getLoading()).toBe(false);

      const promise = userInfoService.getUserInfo();

      await Promise.resolve();
      expect(store.getLoading()).toBe(true);

      await promise;
      expect(store.getLoading()).toBe(false);
      expect(store.getResult()).toEqual(testUser);
    });

    it('should handle getUserInfo failure', async () => {
      const error = new Error('User not found');
      mockGateway.getUserInfo.mockRejectedValue(error);

      await expect(userInfoService.getUserInfo()).rejects.toThrow(
        'User not found'
      );

      const store = userInfoService.getStore();
      expect(store.getLoading()).toBe(false);
      expect(store.getError()).toBe(error);
    });

    it('should throw error when gateway returns null', async () => {
      mockGateway.getUserInfo.mockResolvedValue(null);

      await expect(userInfoService.getUserInfo()).rejects.toThrow(
        ExecutorError
      );
    });

    it('should trigger plugin hooks', async () => {
      const onGetUserInfoBeforeHook = vi.fn();
      const onGetUserInfoSuccessHook = vi.fn();

      userInfoService.use({
        pluginName: 'TestPlugin',
        onGetUserInfoBefore: onGetUserInfoBeforeHook,
        onGetUserInfoSuccess: onGetUserInfoSuccessHook
      } as unknown as Parameters<typeof userInfoService.use>[0]);

      const testUser: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockGateway.getUserInfo.mockResolvedValue(testUser);

      await userInfoService.getUserInfo();

      expect(onGetUserInfoBeforeHook).toHaveBeenCalled();
      expect(onGetUserInfoSuccessHook).toHaveBeenCalled();
    });
  });

  describe('refreshUserInfo', () => {
    it('should refresh user info without parameters', async () => {
      const testUser: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://example.com/avatar.jpg'
      };

      mockGateway.refreshUserInfo.mockResolvedValue(testUser);

      const result = await userInfoService.refreshUserInfo();

      expect(mockGateway.refreshUserInfo).toHaveBeenCalledTimes(1);
      expect(mockGateway.refreshUserInfo).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(testUser);
      expect(userInfoService.getUser()).toEqual(testUser);
    });

    it('should refresh user info with parameters', async () => {
      const testUser: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      const params: RefreshUserInfoParams = {
        force: true,
        token: 'test-token-123'
      };

      mockGateway.refreshUserInfo.mockResolvedValue(testUser);

      const result = await userInfoService.refreshUserInfo(params);

      expect(mockGateway.refreshUserInfo).toHaveBeenCalledWith(params);
      expect(result).toEqual(testUser);
    });

    it('should update store state during refreshUserInfo', async () => {
      const testUser: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockGateway.refreshUserInfo.mockResolvedValue(testUser);
      const store = userInfoService.getStore();

      expect(store.getLoading()).toBe(false);

      const promise = userInfoService.refreshUserInfo();

      await Promise.resolve();
      expect(store.getLoading()).toBe(true);

      await promise;
      expect(store.getLoading()).toBe(false);
      expect(store.getResult()).toEqual(testUser);
    });

    it('should handle refreshUserInfo failure', async () => {
      const error = new Error('Failed to refresh user info');
      mockGateway.refreshUserInfo.mockRejectedValue(error);

      await expect(userInfoService.refreshUserInfo()).rejects.toThrow(
        'Failed to refresh user info'
      );

      const store = userInfoService.getStore();
      expect(store.getLoading()).toBe(false);
      expect(store.getError()).toBe(error);
    });

    it('should throw error when gateway returns null', async () => {
      mockGateway.refreshUserInfo.mockResolvedValue(null);

      await expect(userInfoService.refreshUserInfo()).rejects.toThrow(
        ExecutorError
      );
    });

    it('should trigger plugin hooks', async () => {
      const onRefreshUserInfoBeforeHook = vi.fn();
      const onRefreshUserInfoSuccessHook = vi.fn();

      userInfoService.use({
        pluginName: 'TestPlugin',
        onRefreshUserInfoBefore: onRefreshUserInfoBeforeHook,
        onRefreshUserInfoSuccess: onRefreshUserInfoSuccessHook
      } as unknown as Parameters<typeof userInfoService.use>[0]);

      const testUser: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockGateway.refreshUserInfo.mockResolvedValue(testUser);

      await userInfoService.refreshUserInfo();

      expect(onRefreshUserInfoBeforeHook).toHaveBeenCalled();
      expect(onRefreshUserInfoSuccessHook).toHaveBeenCalled();
    });

    it('should update user info when refreshed', async () => {
      const initialUser: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      const refreshedUser: TestUser = {
        id: 1,
        name: 'John Updated',
        email: 'john.updated@example.com',
        avatar: 'https://example.com/new-avatar.jpg'
      };

      mockGateway.getUserInfo.mockResolvedValue(initialUser);
      mockGateway.refreshUserInfo.mockResolvedValue(refreshedUser);

      await userInfoService.getUserInfo();
      expect(userInfoService.getUser()).toEqual(initialUser);

      await userInfoService.refreshUserInfo();
      expect(userInfoService.getUser()).toEqual(refreshedUser);
    });
  });

  describe('integration', () => {
    it('should handle complete getUserInfo flow', async () => {
      const testUser: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockGateway.getUserInfo.mockResolvedValue(testUser);

      const result = await userInfoService.getUserInfo();

      expect(result).toEqual(testUser);
      expect(userInfoService.getUser()).toEqual(testUser);

      const store = userInfoService.getStore();
      expect(store.getResult()).toEqual(testUser);
      expect(store.isSuccess()).toBe(true);
    });

    it('should handle complete refreshUserInfo flow', async () => {
      const testUser: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockGateway.refreshUserInfo.mockResolvedValue(testUser);

      const result = await userInfoService.refreshUserInfo();

      expect(result).toEqual(testUser);
      expect(userInfoService.getUser()).toEqual(testUser);

      const store = userInfoService.getStore();
      expect(store.getResult()).toEqual(testUser);
      expect(store.isSuccess()).toBe(true);
    });

    it('should handle multiple getUserInfo calls', async () => {
      const user1: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      const user2: TestUser = {
        id: 2,
        name: 'Jane Doe',
        email: 'jane@example.com'
      };

      mockGateway.getUserInfo
        .mockResolvedValueOnce(user1)
        .mockResolvedValueOnce(user2);

      const result1 = await userInfoService.getUserInfo({ userId: 1 });
      expect(result1).toEqual(user1);
      expect(userInfoService.getUser()).toEqual(user1);

      const result2 = await userInfoService.getUserInfo({ userId: 2 });
      expect(result2).toEqual(user2);
      expect(userInfoService.getUser()).toEqual(user2);
    });

    it('should handle getUserInfo and refreshUserInfo sequence', async () => {
      const cachedUser: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      const refreshedUser: TestUser = {
        id: 1,
        name: 'John Updated',
        email: 'john.updated@example.com'
      };

      mockGateway.getUserInfo.mockResolvedValue(cachedUser);
      mockGateway.refreshUserInfo.mockResolvedValue(refreshedUser);

      // First get user info (may use cache)
      const getUserResult = await userInfoService.getUserInfo();
      expect(getUserResult).toEqual(cachedUser);
      expect(userInfoService.getUser()).toEqual(cachedUser);

      // Then refresh user info (always fetches fresh)
      const refreshResult = await userInfoService.refreshUserInfo();
      expect(refreshResult).toEqual(refreshedUser);
      expect(userInfoService.getUser()).toEqual(refreshedUser);
    });

    it('should handle error recovery flow', async () => {
      const error = new Error('Network error');
      const testUser: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockGateway.getUserInfo
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(testUser);

      // First attempt fails
      await expect(userInfoService.getUserInfo()).rejects.toThrow(
        'Network error'
      );

      const store = userInfoService.getStore();
      expect(store.getError()).toBe(error);

      // Second attempt succeeds
      const result = await userInfoService.getUserInfo();
      expect(result).toEqual(testUser);
      expect(store.getError()).toBeNull();
      expect(store.getResult()).toEqual(testUser);
    });
  });
});
