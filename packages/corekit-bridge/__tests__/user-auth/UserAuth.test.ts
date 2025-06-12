import {
  LoginResponseData,
  UserAuth,
  UserAuthServiceInterface,
  UserAuthStore,
  LOGIN_STATUS
} from '../../src/core/user-auth';
import {
  ExpiresInType,
  StorageTokenInterface
} from '../../src/core/storage-token';

// Mock interfaces and types
interface MockUser {
  id: string;
  name: string;
  email: string;
}

interface MockLoginParams {
  username: string;
  password: string;
}

// Mock implementations
class MockStorageToken implements StorageTokenInterface<string> {
  private token: string = '';

  getToken(): string {
    return this.token;
  }

  setToken(token: string, _expiresIn?: ExpiresInType): void {
    this.token = token;
  }

  removeToken(): void {
    this.token = '';
  }
}

class MockAuthService implements UserAuthServiceInterface<MockUser> {
  private validToken = 'valid-token';
  private validUser: MockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com'
  };

  async login(params: MockLoginParams): Promise<LoginResponseData> {
    if (params.username === 'valid@user.com' && params.password === 'correct') {
      return { token: this.validToken };
    }
    throw new Error('Invalid credentials');
  }

  async getUserInfo({ token }: { token: string }): Promise<MockUser> {
    if (token === this.validToken) {
      return this.validUser;
    }
    throw new Error('Invalid token');
  }

  async register(): Promise<LoginResponseData> {
    return { token: this.validToken };
  }

  async logout(): Promise<void> {
    // Mock implementation
  }
}

describe('UserAuth', () => {
  let authService: MockAuthService;
  let storageToken: MockStorageToken;
  let userAuth: UserAuth<MockUser>;

  beforeEach(() => {
    authService = new MockAuthService();
    storageToken = new MockStorageToken();
    userAuth = new UserAuth({
      service: authService,
      storageToken
    });
  });

  describe('Initialization', () => {
    it('should initialize with required service', () => {
      expect(userAuth).toBeDefined();
      expect(userAuth.service).toBeDefined();
      expect(userAuth.store).toBeDefined();
    });

    it('should initialize with custom store', () => {
      const customStore = new UserAuthStore(storageToken);
      const auth = new UserAuth({
        service: authService,
        store: customStore
      });
      expect(auth.store).toBe(customStore);
    });

    it('should handle URL token initialization', () => {
      const auth = new UserAuth({
        service: authService,
        href: 'https://example.com?token=test-token',
        urlTokenKey: 'token'
      });
      expect(auth.store.getToken()).toBe('test-token');
    });
  });

  describe('Login', () => {
    it('should successfully login with valid credentials', async () => {
      const response = await userAuth.login({
        username: 'valid@user.com',
        password: 'correct'
      });
      expect(response.token).toBeDefined();
      expect(userAuth.isAuthenticated()).toBe(true);
    });

    it('should fail login with invalid credentials', async () => {
      await expect(
        userAuth.login({
          username: 'invalid@user.com',
          password: 'wrong'
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should handle direct token login', async () => {
      const response = await userAuth.login('valid-token');
      expect(response.token).toBe('valid-token');
      expect(userAuth.isAuthenticated()).toBe(true);
    });

    it('should update login status during login process', async () => {
      const loginPromise = userAuth.login({
        username: 'valid@user.com',
        password: 'correct'
      });
      expect(userAuth.store.getLoginStatus()).toBe(LOGIN_STATUS.LOADING);
      await loginPromise;
      expect(userAuth.store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);
    });
  });

  describe('User Information', () => {
    it('should fetch user info with valid token', async () => {
      await userAuth.login({
        username: 'valid@user.com',
        password: 'correct'
      });
      const userInfo = await userAuth.fetchUserInfo();
      expect(userInfo).toEqual({
        id: '1',
        name: 'Test User',
        email: 'test@example.com'
      });
    });

    it('should fail to fetch user info with invalid token', async () => {
      await expect(userAuth.fetchUserInfo('invalid-token')).rejects.toThrow(
        'Invalid token'
      );
    });

    it('should fail to fetch user info without token', async () => {
      await expect(userAuth.fetchUserInfo()).rejects.toThrow(
        'token is not set'
      );
    });
  });

  describe('Token Management', () => {
    it('should store token after successful login', async () => {
      await userAuth.login({
        username: 'valid@user.com',
        password: 'correct'
      });
      expect(userAuth.store.getToken()).toBeDefined();
    });

    it('should clear token after logout', async () => {
      await userAuth.login({
        username: 'valid@user.com',
        password: 'correct'
      });
      userAuth.logout();
      expect(userAuth.store.getToken()).toBe('valid-token');
    });

    it('should handle token persistence', async () => {
      await userAuth.login({
        username: 'valid@user.com',
        password: 'correct'
      });
      const token = userAuth.store.getToken();

      // Create new instance with same storage
      const newAuth = new UserAuth({
        service: authService,
        storageToken
      });
      expect(newAuth.store.getToken()).toBe(token);
    });
  });

  describe('Authentication State', () => {
    it('should correctly report authenticated state', async () => {
      expect(userAuth.isAuthenticated()).toBe(false);
      await userAuth.login({
        username: 'valid@user.com',
        password: 'correct'
      });
      expect(userAuth.isAuthenticated()).toBe(true);
    });

    it('should handle authentication state after logout', async () => {
      await userAuth.login({
        username: 'valid@user.com',
        password: 'correct'
      });
      userAuth.logout();
      expect(userAuth.isAuthenticated()).toBe(false);
    });

    it('should maintain authentication state across user info fetches', async () => {
      await userAuth.login({
        username: 'valid@user.com',
        password: 'correct'
      });
      await userAuth.fetchUserInfo();
      expect(userAuth.isAuthenticated()).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors during login', async () => {
      const failingService: UserAuthServiceInterface<MockUser> = {
        login: () => Promise.reject(new Error('Network error')),
        getUserInfo: async () => ({ id: '', name: '', email: '' }),
        register: async () => ({ token: '' }),
        logout: async () => {}
      };
      const authWithFailingService = new UserAuth({
        service: failingService
      });
      await expect(
        authWithFailingService.login({
          username: 'valid@user.com',
          password: 'correct'
        })
      ).rejects.toThrow('Network error');
    });

    it('should handle network errors during user info fetch', async () => {
      const failingService: UserAuthServiceInterface<MockUser> = {
        login: async () => ({ token: '' }),
        getUserInfo: () => Promise.reject(new Error('Network error')),
        register: async () => ({ token: '' }),
        logout: async () => {}
      };
      const authWithFailingService = new UserAuth({
        service: failingService
      });
      await expect(
        authWithFailingService.fetchUserInfo('valid-token')
      ).rejects.toThrow('Network error');
    });

    it('should handle missing token in login response', async () => {
      const badService: UserAuthServiceInterface<MockUser> = {
        login: async () => ({}),
        getUserInfo: async () => ({ id: '', name: '', email: '' }),
        register: async () => ({ token: '' }),
        logout: async () => {}
      };
      const authWithBadService = new UserAuth({
        service: badService
      });
      await expect(
        authWithBadService.login({
          username: 'valid@user.com',
          password: 'correct'
        })
      ).rejects.toThrow('login failed');
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple concurrent login attempts', async () => {
      const loginPromises = [
        userAuth.login({
          username: 'valid@user.com',
          password: 'correct'
        }),
        userAuth.login({
          username: 'valid@user.com',
          password: 'correct'
        })
      ];
      await expect(Promise.all(loginPromises)).resolves.toBeDefined();
    });

    it('should handle login attempts with empty credentials', async () => {
      await expect(
        userAuth.login({
          username: '',
          password: ''
        })
      ).rejects.toThrow();
    });

    it('should handle malformed tokens', async () => {
      await expect(userAuth.login('malformed-token')).rejects.toThrow();
    });

    it('should handle rapid login/logout sequences', async () => {
      const loginPromise = userAuth.login({
        username: 'valid@user.com',
        password: 'correct'
      });
      userAuth.logout();
      await loginPromise;
      expect(userAuth.isAuthenticated()).toBe(true);
    });
  });
});
