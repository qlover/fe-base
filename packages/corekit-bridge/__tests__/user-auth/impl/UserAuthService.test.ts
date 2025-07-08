import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { UserAuthService } from '../../../src/core/user-auth/impl/UserAuthService';
import { UserAuthState } from '../../../src/core/user-auth/impl/UserAuthState';
import { LOGIN_STATUS } from '../../../src/core/user-auth/interface/UserAuthStoreInterface';
import type {
  LoginResponseData,
  UserAuthApiInterface
} from '../../../src/core/user-auth/interface/UserAuthApiInterface';
import type { UserAuthStoreInterface } from '../../../src/core/user-auth/interface/UserAuthStoreInterface';

interface MockUser {
  id: number;
  name: string;
  email: string;
  roles?: string[];
  profile?: {
    avatar?: string;
    preferences?: Record<string, unknown>;
  };
}
class MockAuthState extends UserAuthState<MockUser> {
  constructor(userInfo?: MockUser | null, credential?: string | null) {
    super(userInfo, credential);
  }
}

class MockUserAuthApi implements UserAuthApiInterface<MockAuthState> {
  private store: UserAuthStoreInterface<MockAuthState> | null = null;

  // Mock methods for testing
  public mockLogin: Mock = vi.fn();
  public mockRegister: Mock = vi.fn();
  public mockLogout: Mock = vi.fn();
  public mockGetUserInfo: Mock = vi.fn();

  getStore(): UserAuthStoreInterface<MockAuthState> | null {
    return this.store;
  }

  setStore(store: UserAuthStoreInterface<MockAuthState>): void {
    this.store = store;
  }

  async login(params: unknown): Promise<LoginResponseData> {
    return this.mockLogin(params);
  }

  async register(params: unknown): Promise<LoginResponseData> {
    return this.mockRegister(params);
  }

  async logout(): Promise<void> {
    return this.mockLogout();
  }

  async getUserInfo(params?: unknown): Promise<MockUser> {
    return this.mockGetUserInfo(params);
  }
}

describe('UserAuthService', () => {
  let service: UserAuthService<MockAuthState>;
  let mockApi: MockUserAuthApi;

  // Test data constants
  const mockUser: MockUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    roles: ['user', 'admin'],
    profile: {
      avatar: 'https://example.com/avatar.jpg',
      preferences: {
        theme: 'dark',
        language: 'en'
      }
    }
  };

  const mockCredentials = {
    email: 'john@example.com',
    password: 'password123'
  };

  const mockLoginResponse: LoginResponseData = {
    token: 'auth-token-123',
    refreshToken: 'refresh-token-456',
    expiresIn: 3600
  };

  const mockRegisterData = {
    email: 'newuser@example.com',
    password: 'newpassword123',
    name: 'New User'
  };

  beforeEach(() => {
    mockApi = new MockUserAuthApi();
    service = new UserAuthService<MockAuthState>(mockApi, {});
  });

  /**
   * Test suite for constructor and initialization
   *
   * Tests service initialization with various configuration options
   */
  describe('Constructor and Initialization', () => {
    it('should initialize with required API service', () => {
      expect(service.api).toBe(mockApi);
      expect(service.store).toBeDefined();
      expect(mockApi.getStore()).toBe(service.store);
    });

    it('should throw error when API is not provided', () => {
      expect(() => {
        new UserAuthService<MockAuthState>(
          null as unknown as UserAuthApiInterface<MockAuthState>,
          {}
        );
      }).toThrow('UserAuthService: api is required');
    });

    it('should handle URL token extraction options', () => {
      const serviceWithUrl = new UserAuthService<MockAuthState>(mockApi, {
        href: 'https://example.com/callback?access_token=test123',
        tokenKey: 'access_token'
      });

      expect(serviceWithUrl.api).toBe(mockApi);
      expect(serviceWithUrl.store).toBeDefined();
    });

    it('should not override existing store in API', () => {
      const existingStore = {} as UserAuthStoreInterface<MockAuthState>;
      mockApi.setStore(existingStore);

      new UserAuthService<MockAuthState>(mockApi, {});

      expect(mockApi.getStore()).toBe(existingStore);
    });
  });

  /**
   * Test suite for login functionality
   *
   * Tests user authentication with various scenarios
   */
  describe('Login', () => {
    it('should successfully login user with valid credentials', async () => {
      mockApi.mockLogin.mockResolvedValue(mockLoginResponse);
      mockApi.mockGetUserInfo.mockResolvedValue(mockUser);

      const result = await service.login(mockCredentials);

      expect(mockApi.mockLogin).toHaveBeenCalledWith(mockCredentials);
      expect(mockApi.mockGetUserInfo).toHaveBeenCalledWith(mockLoginResponse);
      expect(result).toEqual(mockLoginResponse);
      expect(service.store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);
      expect(service.store.getUserInfo()).toEqual(mockUser);
    });

    it('should set loading status during login', async () => {
      mockApi.mockLogin.mockImplementation(() => {
        expect(service.store.getLoginStatus()).toBe(LOGIN_STATUS.LOADING);
        return Promise.resolve(mockLoginResponse);
      });
      mockApi.mockGetUserInfo.mockResolvedValue(mockUser);

      await service.login(mockCredentials);

      expect(service.store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);
    });

    it('should handle login API failure', async () => {
      const loginError = new Error('Invalid credentials');
      mockApi.mockLogin.mockRejectedValue(loginError);

      await expect(service.login(mockCredentials)).rejects.toThrow(
        'Invalid credentials'
      );

      expect(service.store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);
      expect(service.store.getUserInfo()).toBeNull();
    });

    it('should handle userInfo fetch failure after successful login', async () => {
      mockApi.mockLogin.mockResolvedValue(mockLoginResponse);
      mockApi.mockGetUserInfo.mockRejectedValue(
        new Error('Failed to fetch user info')
      );

      await expect(service.login(mockCredentials)).rejects.toThrow(
        'Failed to fetch user info'
      );

      expect(service.store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);
    });

    it('should merge user info with existing store data', async () => {
      const existingUser = {
        ...mockUser,
        profile: {
          avatar: 'old-avatar.jpg',
          preferences: { theme: 'light' }
        }
      };
      service.store.setUserInfo(existingUser);

      // API returns user with updated name but same profile structure
      const apiUser = {
        ...mockUser,
        name: 'Updated Name',
        profile: {
          avatar: 'https://example.com/avatar.jpg',
          preferences: {
            theme: 'dark',
            language: 'en'
          }
        }
      };
      mockApi.mockLogin.mockResolvedValue(mockLoginResponse);
      mockApi.mockGetUserInfo.mockResolvedValue(apiUser);

      await service.login(mockCredentials);

      const finalUser = service.store.getUserInfo();
      expect(finalUser?.name).toBe('Updated Name'); // API data takes priority
      expect(finalUser?.profile?.preferences?.theme).toBe('dark'); // API data takes priority
    });
  });

  /**
   * Test suite for registration functionality
   *
   * Tests user registration with various scenarios
   */
  describe('Register', () => {
    it('should successfully register user with valid data', async () => {
      mockApi.mockRegister.mockResolvedValue(mockLoginResponse);
      mockApi.mockGetUserInfo.mockResolvedValue(mockUser);

      const result = await service.register(mockRegisterData);

      expect(mockApi.mockRegister).toHaveBeenCalledWith(mockRegisterData);
      expect(mockApi.mockGetUserInfo).toHaveBeenCalledWith(mockLoginResponse);
      expect(result).toEqual(mockLoginResponse);
      expect(service.store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);
      expect(service.store.getUserInfo()).toEqual(mockUser);
    });

    it('should set loading status during registration', async () => {
      mockApi.mockRegister.mockImplementation(() => {
        expect(service.store.getLoginStatus()).toBe(LOGIN_STATUS.LOADING);
        return Promise.resolve(mockLoginResponse);
      });
      mockApi.mockGetUserInfo.mockResolvedValue(mockUser);

      await service.register(mockRegisterData);

      expect(service.store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);
    });

    it('should handle registration API failure', async () => {
      const registerError = new Error('Email already exists');
      mockApi.mockRegister.mockRejectedValue(registerError);

      await expect(service.register(mockRegisterData)).rejects.toThrow(
        'Email already exists'
      );

      expect(service.store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);
      expect(service.store.getUserInfo()).toBeNull();
    });

    it('should handle userInfo fetch failure after successful registration', async () => {
      mockApi.mockRegister.mockResolvedValue(mockLoginResponse);
      mockApi.mockGetUserInfo.mockRejectedValue(
        new Error('Failed to fetch user info')
      );

      await expect(service.register(mockRegisterData)).rejects.toThrow(
        'Failed to fetch user info'
      );

      expect(service.store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);
    });
  });

  /**
   * Test suite for userInfo functionality
   *
   * Tests user information retrieval and merging
   */
  describe('UserInfo', () => {
    it('should fetch and merge user info successfully', async () => {
      const existingUser = {
        ...mockUser,
        profile: {
          avatar: 'old-avatar.jpg',
          preferences: { theme: 'light' }
        }
      };
      service.store.setUserInfo(existingUser);

      // API returns updated user info
      const apiUser = {
        ...mockUser,
        name: 'Updated Name',
        email: 'updated@example.com',
        profile: {
          avatar: 'https://example.com/avatar.jpg',
          preferences: {
            theme: 'dark',
            language: 'en'
          }
        }
      };
      mockApi.mockGetUserInfo.mockResolvedValue(apiUser);

      const result = await service.userInfo();

      expect(mockApi.mockGetUserInfo).toHaveBeenCalledWith(undefined);
      expect(result.name).toBe('Updated Name'); // API data takes priority
      expect(result.email).toBe('updated@example.com'); // API data takes priority
      expect(result.profile?.preferences?.theme).toBe('dark'); // API data takes priority
    });

    it('should fetch user info with login data', async () => {
      mockApi.mockGetUserInfo.mockResolvedValue(mockUser);

      const result = await service.userInfo(mockLoginResponse);

      expect(mockApi.mockGetUserInfo).toHaveBeenCalledWith(mockLoginResponse);
      expect(result).toEqual(mockUser);
    });

    it('should handle API failure when fetching user info', async () => {
      mockApi.mockGetUserInfo.mockRejectedValue(new Error('API Error'));

      await expect(service.userInfo()).rejects.toThrow('API Error');
    });

    it('should merge with empty store when no existing user info', async () => {
      mockApi.mockGetUserInfo.mockResolvedValue(mockUser);

      const result = await service.userInfo();

      expect(result).toEqual(mockUser);
    });

    it('should handle partial user info from API', async () => {
      const existingUser = {
        ...mockUser,
        profile: {
          avatar: 'old-avatar.jpg',
          preferences: { theme: 'dark' }
        }
      };
      service.store.setUserInfo(existingUser);

      const partialApiUser = { id: 1, name: 'New Name' };
      mockApi.mockGetUserInfo.mockResolvedValue(partialApiUser as MockUser);

      const result = await service.userInfo();

      expect(result.name).toBe('New Name'); // API data
      expect(result.email).toBe(mockUser.email); // Existing data
      expect(result.id).toBe(1); // API data
    });
  });

  /**
   * Test suite for logout functionality
   *
   * Tests user logout with various scenarios
   */
  describe('Logout', () => {
    beforeEach(() => {
      // Set up authenticated state
      service.store.setUserInfo(mockUser);
      service.store.setCredential('test-token');
      service.store.authSuccess();
    });

    it('should successfully logout user', async () => {
      mockApi.mockLogout.mockResolvedValue(undefined);

      await service.logout();

      expect(mockApi.mockLogout).toHaveBeenCalled();
      expect(service.store.getUserInfo()).toBeNull();
      expect(service.store.getCredential()).toBeNull();
      expect(service.store.getLoginStatus()).toBeNull();
    });

    it('should reset local state even when API logout fails', async () => {
      mockApi.mockLogout.mockRejectedValue(new Error('Network error'));

      // API error should be thrown, but local state should still be reset
      await expect(service.logout()).rejects.toThrow('Network error');

      expect(mockApi.mockLogout).toHaveBeenCalled();
      expect(service.store.getUserInfo()).toBeNull();
      expect(service.store.getCredential()).toBeNull();
      expect(service.store.getLoginStatus()).toBeNull();
    });

    it('should handle logout when not authenticated', async () => {
      // Reset to unauthenticated state
      service.store.reset();
      mockApi.mockLogout.mockResolvedValue(undefined);

      await service.logout();

      expect(mockApi.mockLogout).toHaveBeenCalled();
      expect(service.store.getUserInfo()).toBeNull();
      expect(service.store.getLoginStatus()).toBeNull();
    });
  });

  /**
   * Test suite for authentication status checking
   *
   * Tests isAuthenticated method with various states
   */
  describe('Authentication Status', () => {
    it('should return true when user is fully authenticated', () => {
      service.store.setUserInfo(mockUser);
      service.store.authSuccess();

      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when login status is not SUCCESS', () => {
      service.store.setUserInfo(mockUser);
      service.store.startAuth(); // Status is LOADING

      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return false when user info is null', () => {
      service.store.authSuccess(); // Status is SUCCESS but no user info

      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return false when login status is FAILED', () => {
      service.store.setUserInfo(mockUser);
      service.store.authFailed('Login failed');

      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return false in initial state', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return false after logout', async () => {
      // Set up authenticated state
      service.store.setUserInfo(mockUser);
      service.store.authSuccess();
      expect(service.isAuthenticated()).toBe(true);

      // Logout
      mockApi.mockLogout.mockResolvedValue(undefined);
      await service.logout();

      expect(service.isAuthenticated()).toBe(false);
    });
  });

  /**
   * Test suite for integration scenarios
   *
   * Tests complex authentication flows and edge cases
   */
  describe('Integration Scenarios', () => {
    it('should handle complete authentication flow', async () => {
      // Initial state
      expect(service.isAuthenticated()).toBe(false);

      // Login
      mockApi.mockLogin.mockResolvedValue(mockLoginResponse);
      mockApi.mockGetUserInfo.mockResolvedValue(mockUser);
      await service.login(mockCredentials);

      expect(service.isAuthenticated()).toBe(true);
      expect(service.store.getUserInfo()).toEqual(mockUser);

      // Fetch updated user info
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      mockApi.mockGetUserInfo.mockResolvedValue(updatedUser);
      const userInfo = await service.userInfo();

      expect(userInfo.name).toBe('Updated Name');

      // Logout
      mockApi.mockLogout.mockResolvedValue(undefined);
      await service.logout();

      expect(service.isAuthenticated()).toBe(false);
    });

    it('should handle registration flow', async () => {
      // Register new user
      mockApi.mockRegister.mockResolvedValue(mockLoginResponse);
      mockApi.mockGetUserInfo.mockResolvedValue(mockUser);
      await service.register(mockRegisterData);

      expect(service.isAuthenticated()).toBe(true);
      expect(service.store.getUserInfo()).toEqual(mockUser);

      // Should be able to fetch user info after registration
      mockApi.mockGetUserInfo.mockResolvedValue(mockUser);
      const userInfo = await service.userInfo();

      expect(userInfo).toEqual(mockUser);
    });

    it('should handle multiple failed login attempts', async () => {
      mockApi.mockLogin.mockRejectedValue(new Error('Invalid credentials'));

      // First attempt
      await expect(service.login(mockCredentials)).rejects.toThrow(
        'Invalid credentials'
      );
      expect(service.isAuthenticated()).toBe(false);
      expect(service.store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);

      // Second attempt
      await expect(service.login(mockCredentials)).rejects.toThrow(
        'Invalid credentials'
      );
      expect(service.isAuthenticated()).toBe(false);
      expect(service.store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);

      // Successful attempt
      mockApi.mockLogin.mockResolvedValue(mockLoginResponse);
      mockApi.mockGetUserInfo.mockResolvedValue(mockUser);
      await service.login(mockCredentials);

      expect(service.isAuthenticated()).toBe(true);
      expect(service.store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);
    });

    it('should handle concurrent authentication operations', async () => {
      mockApi.mockLogin.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockLoginResponse), 100)
          )
      );
      mockApi.mockGetUserInfo.mockResolvedValue(mockUser);

      // Start multiple login attempts
      const loginPromise1 = service.login(mockCredentials);
      const loginPromise2 = service.login(mockCredentials);

      const [result1, result2] = await Promise.all([
        loginPromise1,
        loginPromise2
      ]);

      expect(result1).toEqual(mockLoginResponse);
      expect(result2).toEqual(mockLoginResponse);
      expect(service.isAuthenticated()).toBe(true);
    });
  });

  /**
   * Test suite for error handling and edge cases
   *
   * Tests various error scenarios and edge cases
   */
  describe('Error Handling and Edge Cases', () => {
    it('should handle API service errors gracefully', async () => {
      mockApi.mockLogin.mockRejectedValue(new Error('Network timeout'));

      await expect(service.login(mockCredentials)).rejects.toThrow(
        'Network timeout'
      );

      expect(service.store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should handle empty or invalid user data', async () => {
      mockApi.mockLogin.mockResolvedValue(mockLoginResponse);
      mockApi.mockGetUserInfo.mockResolvedValue({} as MockUser);

      const result = await service.login(mockCredentials);

      expect(result).toEqual(mockLoginResponse);
      expect(service.store.getUserInfo()).toEqual({});
    });

    it('should maintain state consistency during errors', async () => {
      // Set initial authenticated state
      service.store.setUserInfo(mockUser);
      service.store.authSuccess();

      // Failed login attempt should update state
      mockApi.mockLogin.mockRejectedValue(new Error('Login failed'));

      await expect(service.login(mockCredentials)).rejects.toThrow(
        'Login failed'
      );

      expect(service.store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('Extends UserAuthService', () => {
    /**
     * Custom authentication service extending UserAuthService
     *
     * Tests service extensibility and method overriding capabilities
     */
    class CustomUserAuthService extends UserAuthService<MockAuthState> {
      private loginAttempts = 0;
      private maxLoginAttempts = 3;
      private customFeatures = {
        rateLimiting: true,
        auditLogging: true,
        customValidation: true
      };

      /**
       * Override login with rate limiting and audit logging
       */
      async login(params: unknown): Promise<LoginResponseData> {
        this.loginAttempts++;

        if (this.loginAttempts > this.maxLoginAttempts) {
          throw new Error('Maximum login attempts exceeded');
        }

        // Custom validation
        if (this.customFeatures.customValidation) {
          this.validateLoginParams(params);
        }

        // Audit logging
        if (this.customFeatures.auditLogging) {
          // console.log(`Login attempt ${this.loginAttempts} for user`);
        }

        // Call parent implementation
        const result = await super.login(params);

        // Reset attempts on successful login
        this.loginAttempts = 0;

        return result;
      }

      /**
       * Override register with custom validation
       */
      async register(params: unknown): Promise<LoginResponseData> {
        // Custom pre-registration validation
        this.validateRegistrationParams(params);

        // Call parent implementation
        const result = await super.register(params);

        // Custom post-registration actions
        await this.sendWelcomeEmail(result);

        return result;
      }

      /**
       * Override logout with cleanup
       */
      async logout(): Promise<void> {
        // Custom pre-logout actions
        await this.cleanupUserSessions();

        // Call parent implementation
        await super.logout();

        // Reset custom state
        this.loginAttempts = 0;
      }

      /**
       * Custom method: Get login attempts
       */
      getLoginAttempts(): number {
        return this.loginAttempts;
      }

      /**
       * Custom method: Reset login attempts
       */
      resetLoginAttempts(): void {
        this.loginAttempts = 0;
      }

      /**
       * Custom method: Check if rate limited
       */
      isRateLimited(): boolean {
        return this.loginAttempts >= this.maxLoginAttempts;
      }

      /**
       * Custom method: Get service features
       */
      getFeatures(): typeof this.customFeatures {
        return { ...this.customFeatures };
      }

      /**
       * Custom method: Toggle feature
       */
      toggleFeature(feature: keyof typeof this.customFeatures): void {
        this.customFeatures[feature] = !this.customFeatures[feature];
      }

      /**
       * Custom validation for login parameters
       */
      private validateLoginParams(params: unknown): void {
        if (!params || typeof params !== 'object') {
          throw new Error('Invalid login parameters');
        }

        const loginData = params as Record<string, unknown>;
        if (!loginData.email && !loginData.username) {
          throw new Error('Email or username is required');
        }

        if (!loginData.password) {
          throw new Error('Password is required');
        }
      }

      /**
       * Custom validation for registration parameters
       */
      private validateRegistrationParams(params: unknown): void {
        if (!params || typeof params !== 'object') {
          throw new Error('Invalid registration parameters');
        }

        const regData = params as Record<string, unknown>;
        if (!regData.email) {
          throw new Error('Email is required for registration');
        }

        if (!regData.password) {
          throw new Error('Password is required for registration');
        }

        if (
          typeof regData.password === 'string' &&
          regData.password.length < 8
        ) {
          throw new Error('Password must be at least 8 characters');
        }
      }

      /**
       * Custom method: Send welcome email
       */
      private async sendWelcomeEmail(
        _loginData: LoginResponseData
      ): Promise<void> {
        // Mock implementation
        // console.log('Sending welcome email for token:', loginData.token);
      }

      /**
       * Custom method: Cleanup user sessions
       */
      private async cleanupUserSessions(): Promise<void> {
        // Mock implementation
        // console.log('Cleaning up user sessions');
      }
    }

    /**
     * Advanced custom service with additional features
     */
    class AdvancedUserAuthService extends UserAuthService<MockAuthState> {
      private eventListeners: Map<string, Array<(data?: unknown) => void>> =
        new Map();
      private sessionTimeout: NodeJS.Timeout | null = null;
      private autoRefreshEnabled = true;

      /**
       * Override login with event emission and session management
       */
      async login(params: unknown): Promise<LoginResponseData> {
        this.emit('login:start', params);

        try {
          const result = await super.login(params);

          // Start session timeout
          this.startSessionTimeout();

          this.emit('login:success', result);
          return result;
        } catch (error) {
          this.emit('login:error', error);
          throw error;
        }
      }

      /**
       * Override logout with event emission
       */
      async logout(): Promise<void> {
        this.emit('logout:start');

        try {
          await super.logout();
          this.clearSessionTimeout();
          this.emit('logout:success');
        } catch (error) {
          this.emit('logout:error', error);
          throw error;
        }
      }

      /**
       * Custom method: Add event listener
       */
      addEventListener(
        event: string,
        callback: (data?: unknown) => void
      ): void {
        if (!this.eventListeners.has(event)) {
          this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event)!.push(callback);
      }

      /**
       * Custom method: Remove event listener
       */
      removeEventListener(
        event: string,
        callback: (data?: unknown) => void
      ): void {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
          const index = listeners.indexOf(callback);
          if (index > -1) {
            listeners.splice(index, 1);
          }
        }
      }

      /**
       * Custom method: Emit event with error handling
       */
      private emit(event: string, data?: unknown): void {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
          listeners.forEach((callback) => {
            try {
              callback(data);
            } catch {
              // Silently handle errors to prevent breaking the main flow
              // In a real implementation, you might want to use a proper logger
            }
          });
        }
      }

      /**
       * Custom method: Start session timeout
       */
      private startSessionTimeout(): void {
        this.clearSessionTimeout();
        this.sessionTimeout = setTimeout(
          () => {
            this.emit('session:timeout');
            this.logout();
          },
          30 * 60 * 1000
        ); // 30 minutes
      }

      /**
       * Custom method: Clear session timeout
       */
      private clearSessionTimeout(): void {
        if (this.sessionTimeout) {
          clearTimeout(this.sessionTimeout);
          this.sessionTimeout = null;
        }
      }

      /**
       * Custom method: Enable/disable auto refresh
       */
      setAutoRefresh(enabled: boolean): void {
        this.autoRefreshEnabled = enabled;
      }

      /**
       * Custom method: Get session info
       */
      getSessionInfo(): {
        hasTimeout: boolean;
        autoRefreshEnabled: boolean;
        eventListeners: string[];
      } {
        return {
          hasTimeout: !!this.sessionTimeout,
          autoRefreshEnabled: this.autoRefreshEnabled,
          eventListeners: Array.from(this.eventListeners.keys())
        };
      }
    }

    let customService: CustomUserAuthService;
    let advancedService: AdvancedUserAuthService;
    let mockApi: MockUserAuthApi;

    beforeEach(() => {
      mockApi = new MockUserAuthApi();
      customService = new CustomUserAuthService(mockApi, {});
      advancedService = new AdvancedUserAuthService(mockApi, {});
    });

    describe('Basic Service Extension', () => {
      it('should extend UserAuthService correctly', () => {
        expect(customService).toBeInstanceOf(UserAuthService);
        expect(customService).toBeInstanceOf(CustomUserAuthService);
        expect(customService.api).toBe(mockApi);
        expect(customService.store).toBeDefined();
      });

      it('should inherit parent methods', () => {
        expect(typeof customService.login).toBe('function');
        expect(typeof customService.register).toBe('function');
        expect(typeof customService.logout).toBe('function');
        expect(typeof customService.userInfo).toBe('function');
        expect(typeof customService.isAuthenticated).toBe('function');
      });

      it('should have custom methods', () => {
        expect(typeof customService.getLoginAttempts).toBe('function');
        expect(typeof customService.resetLoginAttempts).toBe('function');
        expect(typeof customService.isRateLimited).toBe('function');
        expect(typeof customService.getFeatures).toBe('function');
        expect(typeof customService.toggleFeature).toBe('function');
      });

      it('should maintain parent functionality', async () => {
        mockApi.mockLogin.mockResolvedValue(mockLoginResponse);
        mockApi.mockGetUserInfo.mockResolvedValue(mockUser);

        const result = await customService.login(mockCredentials);

        expect(result).toEqual(mockLoginResponse);
        expect(customService.isAuthenticated()).toBe(true);
        expect(customService.store.getUserInfo()).toEqual(mockUser);
      });
    });

    describe('Custom Login Implementation', () => {
      it('should track login attempts', async () => {
        mockApi.mockLogin.mockRejectedValue(new Error('Invalid credentials'));

        expect(customService.getLoginAttempts()).toBe(0);

        // First failed attempt
        await expect(customService.login(mockCredentials)).rejects.toThrow();
        expect(customService.getLoginAttempts()).toBe(1);

        // Second failed attempt
        await expect(customService.login(mockCredentials)).rejects.toThrow();
        expect(customService.getLoginAttempts()).toBe(2);
      });

      it('should enforce rate limiting', async () => {
        mockApi.mockLogin.mockRejectedValue(new Error('Invalid credentials'));

        // Exhaust login attempts
        for (let i = 0; i < 3; i++) {
          await expect(customService.login(mockCredentials)).rejects.toThrow();
        }

        expect(customService.isRateLimited()).toBe(true);

        // Next attempt should be rate limited
        await expect(customService.login(mockCredentials)).rejects.toThrow(
          'Maximum login attempts exceeded'
        );
      });

      it('should reset attempts on successful login', async () => {
        mockApi.mockLogin.mockRejectedValueOnce(
          new Error('Invalid credentials')
        );
        mockApi.mockLogin.mockResolvedValueOnce(mockLoginResponse);
        mockApi.mockGetUserInfo.mockResolvedValue(mockUser);

        // Failed attempt
        await expect(customService.login(mockCredentials)).rejects.toThrow();
        expect(customService.getLoginAttempts()).toBe(1);

        // Successful attempt
        await customService.login(mockCredentials);
        expect(customService.getLoginAttempts()).toBe(0);
        expect(customService.isRateLimited()).toBe(false);
      });

      it('should validate login parameters', async () => {
        await expect(customService.login(null)).rejects.toThrow(
          'Invalid login parameters'
        );

        await expect(customService.login({})).rejects.toThrow(
          'Email or username is required'
        );

        await expect(
          customService.login({ email: 'test@example.com' })
        ).rejects.toThrow('Password is required');
      });

      it('should allow manual reset of login attempts', async () => {
        mockApi.mockLogin.mockRejectedValue(new Error('Invalid credentials'));

        await expect(customService.login(mockCredentials)).rejects.toThrow();
        expect(customService.getLoginAttempts()).toBe(1);

        customService.resetLoginAttempts();
        expect(customService.getLoginAttempts()).toBe(0);
        expect(customService.isRateLimited()).toBe(false);
      });
    });

    describe('Custom Registration Implementation', () => {
      it('should validate registration parameters', async () => {
        await expect(customService.register(null)).rejects.toThrow(
          'Invalid registration parameters'
        );

        await expect(customService.register({})).rejects.toThrow(
          'Email is required for registration'
        );

        await expect(
          customService.register({ email: 'test@example.com' })
        ).rejects.toThrow('Password is required for registration');

        await expect(
          customService.register({
            email: 'test@example.com',
            password: '123'
          })
        ).rejects.toThrow('Password must be at least 8 characters');
      });

      it('should call parent register method', async () => {
        mockApi.mockRegister.mockResolvedValue(mockLoginResponse);
        mockApi.mockGetUserInfo.mockResolvedValue(mockUser);

        const validParams = {
          email: 'test@example.com',
          password: 'password123'
        };

        const result = await customService.register(validParams);

        expect(mockApi.mockRegister).toHaveBeenCalledWith(validParams);
        expect(result).toEqual(mockLoginResponse);
        expect(customService.isAuthenticated()).toBe(true);
      });
    });

    describe('Custom Logout Implementation', () => {
      it('should reset custom state on logout', async () => {
        mockApi.mockLogin.mockRejectedValue(new Error('Invalid credentials'));
        mockApi.mockLogout.mockResolvedValue(undefined);

        // Create some login attempts
        await expect(customService.login(mockCredentials)).rejects.toThrow();
        expect(customService.getLoginAttempts()).toBe(1);

        // Logout should reset attempts
        await customService.logout();
        expect(customService.getLoginAttempts()).toBe(0);
      });
    });

    describe('Custom Features Management', () => {
      it('should manage custom features', () => {
        const features = customService.getFeatures();
        expect(features.rateLimiting).toBe(true);
        expect(features.auditLogging).toBe(true);
        expect(features.customValidation).toBe(true);

        customService.toggleFeature('rateLimiting');
        const updatedFeatures = customService.getFeatures();
        expect(updatedFeatures.rateLimiting).toBe(false);
      });
    });

    describe('Advanced Service Extension', () => {
      it('should extend with event system', () => {
        expect(typeof advancedService.addEventListener).toBe('function');
        expect(typeof advancedService.removeEventListener).toBe('function');
        expect(typeof advancedService.setAutoRefresh).toBe('function');
        expect(typeof advancedService.getSessionInfo).toBe('function');
      });

      it('should emit events during authentication', async () => {
        const loginStartSpy = vi.fn();
        const loginSuccessSpy = vi.fn();
        const loginErrorSpy = vi.fn();

        advancedService.addEventListener('login:start', loginStartSpy);
        advancedService.addEventListener('login:success', loginSuccessSpy);
        advancedService.addEventListener('login:error', loginErrorSpy);

        mockApi.mockLogin.mockResolvedValue(mockLoginResponse);
        mockApi.mockGetUserInfo.mockResolvedValue(mockUser);

        await advancedService.login(mockCredentials);

        expect(loginStartSpy).toHaveBeenCalledWith(mockCredentials);
        expect(loginSuccessSpy).toHaveBeenCalledWith(mockLoginResponse);
        expect(loginErrorSpy).not.toHaveBeenCalled();
      });

      it('should emit error events on login failure', async () => {
        const loginErrorSpy = vi.fn();
        advancedService.addEventListener('login:error', loginErrorSpy);

        const error = new Error('Login failed');
        mockApi.mockLogin.mockRejectedValue(error);

        await expect(advancedService.login(mockCredentials)).rejects.toThrow();
        expect(loginErrorSpy).toHaveBeenCalledWith(error);
      });

      it('should emit logout events', async () => {
        const logoutStartSpy = vi.fn();
        const logoutSuccessSpy = vi.fn();

        advancedService.addEventListener('logout:start', logoutStartSpy);
        advancedService.addEventListener('logout:success', logoutSuccessSpy);

        mockApi.mockLogout.mockResolvedValue(undefined);

        await advancedService.logout();

        expect(logoutStartSpy).toHaveBeenCalled();
        expect(logoutSuccessSpy).toHaveBeenCalled();
      });

      it('should manage event listeners', () => {
        const callback1 = vi.fn();
        const callback2 = vi.fn();

        advancedService.addEventListener('test:event', callback1);
        advancedService.addEventListener('test:event', callback2);

        const sessionInfo = advancedService.getSessionInfo();
        expect(sessionInfo.eventListeners).toContain('test:event');

        advancedService.removeEventListener('test:event', callback1);
        // Should still have callback2
      });

      it('should manage session info', () => {
        const sessionInfo = advancedService.getSessionInfo();
        expect(sessionInfo).toHaveProperty('hasTimeout');
        expect(sessionInfo).toHaveProperty('autoRefreshEnabled');
        expect(sessionInfo).toHaveProperty('eventListeners');
        expect(sessionInfo.autoRefreshEnabled).toBe(true);

        advancedService.setAutoRefresh(false);
        const updatedInfo = advancedService.getSessionInfo();
        expect(updatedInfo.autoRefreshEnabled).toBe(false);
      });

      it('should handle errors in event emission', async () => {
        const errorCallback = vi.fn(() => {
          throw new Error('Event handler error');
        });
        const successCallback = vi.fn();

        advancedService.addEventListener('login:start', errorCallback);
        advancedService.addEventListener('login:start', successCallback);

        mockApi.mockLogin.mockResolvedValue(mockLoginResponse);
        mockApi.mockGetUserInfo.mockResolvedValue(mockUser);

        // Should not prevent login from completing despite error in event handler
        const result = await advancedService.login(mockCredentials);

        expect(result).toEqual(mockLoginResponse);
        expect(errorCallback).toHaveBeenCalledWith(mockCredentials);
        expect(successCallback).toHaveBeenCalledWith(mockCredentials);
        expect(advancedService.isAuthenticated()).toBe(true);
      });
    });

    describe('Multiple Inheritance Scenarios', () => {
      it('should handle multiple custom services', () => {
        const service1 = new CustomUserAuthService(mockApi, {});
        const service2 = new AdvancedUserAuthService(mockApi, {});

        expect(service1).toBeInstanceOf(UserAuthService);
        expect(service2).toBeInstanceOf(UserAuthService);
        expect(service1).not.toBeInstanceOf(AdvancedUserAuthService);
        expect(service2).not.toBeInstanceOf(CustomUserAuthService);
      });

      it('should maintain independent state', async () => {
        const service1 = new CustomUserAuthService(mockApi, {});
        const service2 = new CustomUserAuthService(mockApi, {});

        mockApi.mockLogin.mockRejectedValue(new Error('Invalid credentials'));

        await expect(service1.login(mockCredentials)).rejects.toThrow();
        expect(service1.getLoginAttempts()).toBe(1);
        expect(service2.getLoginAttempts()).toBe(0);

        await expect(service2.login(mockCredentials)).rejects.toThrow();
        expect(service1.getLoginAttempts()).toBe(1);
        expect(service2.getLoginAttempts()).toBe(1);
      });
    });

    describe('Error Handling in Extended Services', () => {
      it('should handle errors in custom validation', async () => {
        customService.toggleFeature('customValidation');

        // Should not throw validation error when feature is disabled
        mockApi.mockLogin.mockRejectedValue(new Error('API Error'));

        await expect(customService.login({})).rejects.toThrow('API Error');
        expect(customService.getLoginAttempts()).toBe(1);
      });
    });
  });

  /**
   * Test suite for complex configuration scenarios
   *
   * Tests various configuration options including storage, URL parameters, and custom options
   */
  describe('Complex Configuration Scenarios', () => {
    let mockApi: MockUserAuthApi;

    beforeEach(() => {
      mockApi = new MockUserAuthApi();
    });

    /**
     * Test suite for storage configuration
     */
    describe('Storage Configuration', () => {
      it('should initialize with custom user storage configuration', () => {
        const userStorageConfig = {
          key: 'custom-user-key'
        };

        const service = new UserAuthService<MockAuthState>(mockApi, {
          userStorage: userStorageConfig
        });

        expect(service.api).toBe(mockApi);
        expect(service.store).toBeDefined();
        expect(service.store.getUserStorage()).toBeDefined();
      });

      it('should initialize with custom credential storage configuration', () => {
        const credentialStorageConfig = {
          key: 'custom-credential-key'
        };

        const service = new UserAuthService<MockAuthState>(mockApi, {
          credentialStorage: credentialStorageConfig
        });

        expect(service.api).toBe(mockApi);
        expect(service.store).toBeDefined();
        expect(service.store.getCredentialStorage()).toBeDefined();
      });

      it('should initialize with both user and credential storage configurations', () => {
        const userStorageConfig = {
          key: 'user-data'
        };

        const credentialStorageConfig = {
          key: 'auth-token'
        };

        const service = new UserAuthService<MockAuthState>(mockApi, {
          userStorage: userStorageConfig,
          credentialStorage: credentialStorageConfig
        });

        expect(service.store.getUserStorage()).toBeDefined();
        expect(service.store.getCredentialStorage()).toBeDefined();
      });

      it('should handle different storage configurations', () => {
        const configurations = [
          {
            name: 'basic user storage',
            config: {
              userStorage: { key: 'user-1' }
            }
          },
          {
            name: 'basic credential storage',
            config: {
              credentialStorage: { key: 'cred-1' }
            }
          },
          {
            name: 'both storage types',
            config: {
              userStorage: { key: 'user-2' },
              credentialStorage: { key: 'cred-2' }
            }
          }
        ];

        configurations.forEach(({ config }) => {
          const service = new UserAuthService<MockAuthState>(mockApi, config);
          expect(service.store).toBeDefined();
          if (config.userStorage) {
            expect(service.store.getUserStorage()).toBeDefined();
          }
          if (config.credentialStorage) {
            expect(service.store.getCredentialStorage()).toBeDefined();
          }
        });
      });

      it('should handle disabled storage configurations', () => {
        const service1 = new UserAuthService<MockAuthState>(mockApi, {
          userStorage: false
        });

        const service2 = new UserAuthService<MockAuthState>(mockApi, {
          credentialStorage: false
        });

        const service3 = new UserAuthService<MockAuthState>(mockApi, {
          userStorage: false,
          credentialStorage: false
        });

        expect(service1.store.getUserStorage()).toBeNull();
        expect(service2.store.getCredentialStorage()).toBeNull();
        expect(service3.store.getUserStorage()).toBeNull();
        expect(service3.store.getCredentialStorage()).toBeNull();
      });
    });

    /**
     * Test suite for URL parameter configuration
     */
    describe('URL Parameter Configuration', () => {
      it('should initialize with URL token extraction configuration', () => {
        const urlConfig = {
          href: 'https://example.com/callback?access_token=abc123&refresh_token=def456',
          tokenKey: 'access_token'
        };

        const service = new UserAuthService<MockAuthState>(mockApi, urlConfig);

        expect(service.api).toBe(mockApi);
        expect(service.store).toBeDefined();
      });

      it('should handle different URL parameter extraction scenarios', () => {
        const scenarios = [
          {
            name: 'OAuth callback with access token',
            config: {
              href: 'https://app.example.com/auth/callback?access_token=eyJhbGciOiJIUzI1NiJ9&token_type=Bearer&expires_in=3600',
              tokenKey: 'access_token'
            }
          },
          {
            name: 'Custom token parameter',
            config: {
              href: 'https://app.example.com/login?auth_token=custom-token-123&user_id=456',
              tokenKey: 'auth_token'
            }
          },
          {
            name: 'JWT token from URL',
            config: {
              href: 'https://app.example.com/verify?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9&state=xyz',
              tokenKey: 'jwt'
            }
          }
        ];

        scenarios.forEach(({ config }) => {
          const service = new UserAuthService<MockAuthState>(mockApi, config);
          expect(service.api).toBe(mockApi);
          expect(service.store).toBeDefined();
        });
      });

      it('should handle URL configuration with storage options', () => {
        const combinedConfig = {
          href: 'https://example.com/callback?token=abc123',
          tokenKey: 'token',
          userStorage: { key: 'oauth-user' },
          credentialStorage: { key: 'oauth-token' }
        };

        const service = new UserAuthService<MockAuthState>(
          mockApi,
          combinedConfig
        );

        expect(service.store.getUserStorage()).toBeDefined();
        expect(service.store.getCredentialStorage()).toBeDefined();
      });
    });

    /**
     * Test suite for comprehensive configuration combinations
     */
    describe('Comprehensive Configuration Combinations', () => {
      it('should handle enterprise-level configuration', () => {
        const enterpriseConfig = {
          href: 'https://enterprise.example.com/sso/callback?saml_token=enterprise_token_123&org_id=org_456',
          tokenKey: 'saml_token',
          userStorage: { key: 'enterprise-user-profile' },
          credentialStorage: { key: 'enterprise-auth-token' }
        };

        const service = new UserAuthService<MockAuthState>(
          mockApi,
          enterpriseConfig
        );

        expect(service.api).toBe(mockApi);
        expect(service.store).toBeDefined();
        expect(service.store.getUserStorage()).toBeDefined();
        expect(service.store.getCredentialStorage()).toBeDefined();
      });

      it('should handle mobile app configuration', () => {
        const mobileConfig = {
          userStorage: { key: 'mobile-user-data' },
          credentialStorage: { key: 'mobile-refresh-token' }
        };

        const service = new UserAuthService<MockAuthState>(
          mockApi,
          mobileConfig
        );

        expect(service.store.getUserStorage()).toBeDefined();
        expect(service.store.getCredentialStorage()).toBeDefined();
      });

      it('should handle development environment configuration', () => {
        const devConfig = {
          href: 'http://localhost:3000/dev/callback?dev_token=dev_123&debug=true',
          tokenKey: 'dev_token',
          userStorage: { key: 'dev-user' },
          credentialStorage: { key: 'dev-token' }
        };

        const service = new UserAuthService<MockAuthState>(mockApi, devConfig);

        expect(service.store.getUserStorage()).toBeDefined();
        expect(service.store.getCredentialStorage()).toBeDefined();
      });

      it('should handle security-focused configuration', () => {
        const securityConfig = {
          userStorage: { key: 'secure-user-data' },
          credentialStorage: { key: 'secure-auth-token' }
        };

        const service = new UserAuthService<MockAuthState>(
          mockApi,
          securityConfig
        );

        expect(service.store.getUserStorage()).toBeDefined();
        expect(service.store.getCredentialStorage()).toBeDefined();
      });
    });

    /**
     * Test suite for configuration validation and edge cases
     */
    describe('Configuration Validation and Edge Cases', () => {
      it('should handle empty configuration object', () => {
        const service = new UserAuthService<MockAuthState>(mockApi, {});

        expect(service.api).toBe(mockApi);
        expect(service.store).toBeDefined();
      });

      it('should handle configuration with only URL parameters', () => {
        const urlOnlyConfig = {
          href: 'https://example.com/callback?token=test123',
          tokenKey: 'token'
        };

        const service = new UserAuthService<MockAuthState>(
          mockApi,
          urlOnlyConfig
        );

        expect(service.api).toBe(mockApi);
        expect(service.store).toBeDefined();
      });

      it('should handle configuration with only storage parameters', () => {
        const storageOnlyConfig = {
          userStorage: { key: 'storage-only-user' }
        };

        const service = new UserAuthService<MockAuthState>(
          mockApi,
          storageOnlyConfig
        );

        expect(service.store.getUserStorage()).toBeDefined();
      });
    });

    /**
     * Test suite for configuration behavior during authentication flow
     */
    describe('Configuration Behavior During Authentication', () => {
      it('should respect storage configuration during login flow', async () => {
        const config = {
          userStorage: { key: 'auth-flow-user' },
          credentialStorage: { key: 'auth-flow-token' }
        };

        const service = new UserAuthService<MockAuthState>(mockApi, config);

        mockApi.mockLogin.mockResolvedValue(mockLoginResponse);
        mockApi.mockGetUserInfo.mockResolvedValue(mockUser);

        await service.login(mockCredentials);

        expect(service.isAuthenticated()).toBe(true);
        expect(service.store.getUserInfo()).toEqual(mockUser);
        expect(service.store.getCredential()).toBe(mockLoginResponse.token);
      });

      it('should handle multiple service instances with different configurations', () => {
        const config1 = {
          userStorage: { key: 'service1-user' }
        };

        const config2 = {
          userStorage: { key: 'service2-user' }
        };

        const service1 = new UserAuthService<MockAuthState>(mockApi, config1);
        const service2 = new UserAuthService<MockAuthState>(mockApi, config2);

        expect(service1.store.getUserStorage()).toBeDefined();
        expect(service2.store.getUserStorage()).toBeDefined();
        expect(service1.store).not.toBe(service2.store);
      });
    });
  });
});
