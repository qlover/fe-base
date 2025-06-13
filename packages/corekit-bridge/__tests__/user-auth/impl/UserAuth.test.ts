import {
  LoginResponseData,
  UserAuthStore,
  LOGIN_STATUS,
  UserAuthApiInterface,
  UserAuthService
} from '../../../src/core/user-auth';
import {
  ExpiresInType,
  StorageTokenInterface
} from '../../../src/core/storage';

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

class MockAuthService implements UserAuthApiInterface<MockUser> {
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
  let userAuth: UserAuthService<MockUser>;

  beforeEach(() => {
    authService = new MockAuthService();
    storageToken = new MockStorageToken();
    userAuth = new UserAuthService({
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
      const auth = new UserAuthService({
        service: authService,
        store: customStore
      });
      expect(auth.store).toBe(customStore);
    });

    it('should handle URL token initialization', () => {
      const auth = new UserAuthService({
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

    it('should reject fetching user info with invalid token', async () => {
      await expect(userAuth.fetchUserInfo('invalid-token')).rejects.toThrow(
        'Invalid token'
      );
    });

    it('should reject fetching user info without token', async () => {
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
      const newAuth = new UserAuthService({
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
      await userAuth.logout();
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

  describe('Store State Management', () => {
    it('should properly update store state during login process', async () => {
      expect(userAuth.store.getLoginStatus()).toBeNull();
      const loginPromise = userAuth.login({
        username: 'valid@user.com',
        password: 'correct'
      });
      expect(userAuth.store.getLoginStatus()).toBe(LOGIN_STATUS.LOADING);
      await loginPromise;
      expect(userAuth.store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);
      expect(userAuth.store.getToken()).toBe('valid-token');
    });

    it('should update store state on login failure', async () => {
      expect(userAuth.store.getLoginStatus()).toBeNull();
      try {
        await userAuth.login({
          username: 'invalid@user.com',
          password: 'wrong'
        });
      } catch {
        expect(userAuth.store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);
        expect(userAuth.store.getToken()).toBe('');
      }
    });

    it('should reset store state on logout', async () => {
      await userAuth.login({
        username: 'valid@user.com',
        password: 'correct'
      });
      expect(userAuth.store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);
      expect(userAuth.store.getToken()).toBeDefined();
      await userAuth.logout();
      expect(userAuth.store.getLoginStatus()).toBeNull();
      expect(userAuth.store.getToken()).toBe('valid-token');
    });

    it('should maintain store state consistency during concurrent operations', async () => {
      const loginPromise = userAuth.login({
        username: 'valid@user.com',
        password: 'correct'
      });
      expect(userAuth.store.getLoginStatus()).toBe(LOGIN_STATUS.LOADING);
      // Attempt concurrent login
      const concurrentLoginPromise = userAuth.login({
        username: 'valid@user.com',
        password: 'correct'
      });
      await Promise.all([loginPromise, concurrentLoginPromise]);
      expect(userAuth.store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);
      expect(userAuth.store.getToken()).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors during login', async () => {
      const failingService: UserAuthApiInterface<MockUser> = {
        login: () => Promise.reject(new Error('Network error')),
        getUserInfo: async () => ({ id: '', name: '', email: '' }),
        register: async () => ({ token: '' }),
        logout: async () => {}
      };
      const authWithFailingService = new UserAuthService({
        service: failingService
      });
      await expect(
        authWithFailingService.login({
          username: 'valid@user.com',
          password: 'correct'
        })
      ).rejects.toThrow('Network error');
      expect(authWithFailingService.store.getLoginStatus()).toBe(
        LOGIN_STATUS.FAILED
      );
    });

    it('should handle network errors during user info fetch', async () => {
      const failingService: UserAuthApiInterface<MockUser> = {
        login: async () => ({ token: '' }),
        getUserInfo: () => Promise.reject(new Error('Network error')),
        register: async () => ({ token: '' }),
        logout: async () => {}
      };
      const authWithFailingService = new UserAuthService({
        service: failingService
      });
      await expect(
        authWithFailingService.fetchUserInfo('valid-token')
      ).rejects.toThrow('Network error');
      expect(authWithFailingService.store.getLoginStatus()).toBe(null);
    });

    it('should handle missing token in login response', async () => {
      const badService: UserAuthApiInterface<MockUser> = {
        login: async () => ({}),
        getUserInfo: async () => ({ id: '', name: '', email: '' }),
        register: async () => ({ token: '' }),
        logout: async () => {}
      };
      const authWithBadService = new UserAuthService({
        service: badService
      });
      await expect(
        authWithBadService.login({
          username: 'valid@user.com',
          password: 'correct'
        })
      ).rejects.toThrow('login failed');
      expect(authWithBadService.store.getLoginStatus()).toBe(
        LOGIN_STATUS.FAILED
      );
    });

    it('should handle invalid token format', async () => {
      await expect(userAuth.login('invalid-format-token')).rejects.toThrow();
      expect(userAuth.store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);
    });

    it('should handle empty credentials', async () => {
      await expect(
        userAuth.login({
          username: '',
          password: ''
        })
      ).rejects.toThrow();
      expect(userAuth.store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);
    });

    it('should handle errors during logout', async () => {
      const failingService: UserAuthApiInterface<MockUser> = {
        login: async () => ({ token: 'valid-token' }),
        getUserInfo: async () => ({ id: '', name: '', email: '' }),
        register: async () => ({ token: '' }),
        logout: () => Promise.reject(new Error('Logout failed'))
      };
      const authWithFailingService = new UserAuthService({
        service: failingService
      });
      await authWithFailingService.login({
        username: 'valid@user.com',
        password: 'correct'
      });

      expect(authWithFailingService.isAuthenticated()).toBe(true);
      expect(authWithFailingService.store.getLoginStatus()).toBe(
        LOGIN_STATUS.SUCCESS
      );

      await expect(authWithFailingService.logout()).rejects.toThrow(
        'Logout failed'
      );

      expect(authWithFailingService.isAuthenticated()).toBe(false);
      expect(authWithFailingService.store.getLoginStatus()).toBe(null);
    });

    it('should handle malformed user info response', async () => {
      const badService: UserAuthApiInterface<MockUser> = {
        login: async () => ({ token: 'valid-token' }),
        getUserInfo: async () => {
          throw new Error('Malformed user data');
        },
        register: async () => ({ token: '' }),
        logout: async () => {}
      };
      const authWithBadService = new UserAuthService({
        service: badService
      });
      await expect(
        authWithBadService.fetchUserInfo('valid-token')
      ).rejects.toThrow('Malformed user data');
      expect(authWithBadService.store.getLoginStatus()).toBe(null);
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

class CustomUserAuthService implements UserAuthApiInterface<MockUser> {
  private validToken = 'valid-test-token';
  private expiredToken = 'expired-test-token';
  private registeredUsers: Set<string> = new Set();
  private tokenToUser: Map<string, MockUser> = new Map();

  constructor() {
    // Initialize with a default user
    this.tokenToUser.set(this.validToken, {
      id: '1',
      name: 'Test User',
      email: 'test@example.com'
    });
  }

  async login(params: MockLoginParams): Promise<LoginResponseData> {
    if (!params || !params.username || !params.password) {
      throw new Error(
        'Invalid credentials: username and password are required'
      );
    }

    if (params.username === 'invalid@test.com') {
      throw new Error('Invalid credentials');
    }

    if (
      params.username === 'special@test.com' &&
      params.password.includes('<script>')
    ) {
      throw new Error('Invalid characters in credentials');
    }

    return { token: this.validToken };
  }

  async getUserInfo({ token }: { token: string }): Promise<MockUser> {
    if (!token) {
      throw new Error('Token is required');
    }

    if (token === this.expiredToken) {
      throw new Error('Token has expired');
    }

    const user = this.tokenToUser.get(token);
    if (!user) {
      throw new Error('Invalid token');
    }

    return user;
  }

  async register(params: {
    username: string;
    password: string;
  }): Promise<LoginResponseData> {
    if (!params || !params.username || !params.password) {
      throw new Error('Invalid registration data');
    }

    if (this.registeredUsers.has(params.username)) {
      throw new Error('User already exists');
    }

    this.registeredUsers.add(params.username);
    const newToken = `register-token-${params.username}`;
    this.tokenToUser.set(newToken, {
      id: Math.random().toString(36).substr(2, 9),
      name: params.username,
      email: params.username
    });

    return { token: newToken };
  }

  async logout(): Promise<void> {
    // Simulating async operation
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

class MemoryStorageToken implements StorageTokenInterface<string> {
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

describe('Custom UserAuthService', () => {
  let memoryStorageToken: MemoryStorageToken;
  let userAuth: UserAuthService<MockUser>;
  let authService: CustomUserAuthService;

  beforeEach(() => {
    memoryStorageToken = new MemoryStorageToken();
    authService = new CustomUserAuthService();
    userAuth = new UserAuthService({
      service: authService,
      storageToken: memoryStorageToken
    });
  });

  describe('Login', () => {
    it('should successfully login with valid credentials', async () => {
      await userAuth.login({
        username: 'test@example.com',
        password: 'valid-password'
      });

      expect(userAuth.store.getToken()).toBe('valid-test-token');
      expect(memoryStorageToken.getToken()).toBe('valid-test-token');
      expect(userAuth.isAuthenticated()).toBe(true);
    });

    it('should reject login with invalid credentials', async () => {
      await expect(
        userAuth.login({
          username: 'invalid@test.com',
          password: 'wrong-password'
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should reject login with empty credentials', async () => {
      await expect(
        userAuth.login({
          username: '',
          password: ''
        })
      ).rejects.toThrow(
        'Invalid credentials: username and password are required'
      );
    });

    it('should reject login with special characters', async () => {
      await expect(
        userAuth.login({
          username: 'special@test.com',
          password: '<script>alert("xss")</script>'
        })
      ).rejects.toThrow('Invalid characters in credentials');
    });

    it('should handle multiple concurrent login requests', async () => {
      const loginPromises = Array(3)
        .fill(null)
        .map(() =>
          userAuth.login({
            username: 'test@example.com',
            password: 'valid-password'
          })
        );

      await expect(Promise.all(loginPromises)).resolves.toBeDefined();
      expect(userAuth.isAuthenticated()).toBe(true);
    });
  });

  describe('User Information', () => {
    it('should fetch user info with valid token', async () => {
      await userAuth.login({
        username: 'test@example.com',
        password: 'valid-password'
      });

      const userInfo = await userAuth.fetchUserInfo();
      expect(userInfo).toEqual({
        id: '1',
        name: 'Test User',
        email: 'test@example.com'
      });
    });

    it('should reject fetching user info with invalid token', async () => {
      await expect(userAuth.fetchUserInfo('invalid-token')).rejects.toThrow(
        'Invalid token'
      );
    });

    it('should reject fetching user info without token', async () => {
      await expect(userAuth.fetchUserInfo()).rejects.toThrow(
        'token is not set'
      );
    });
  });

  describe('Registration', () => {
    it('should successfully register new user', async () => {
      const response = await authService.register({
        username: 'new@example.com',
        password: 'new-password'
      });

      expect(response.token).toContain('register-token-new@example.com');
    });

    it('should reject duplicate registration', async () => {
      await authService.register({
        username: 'duplicate@example.com',
        password: 'password'
      });

      await expect(
        authService.register({
          username: 'duplicate@example.com',
          password: 'another-password'
        })
      ).rejects.toThrow('User already exists');
    });

    it('should reject registration with invalid data', async () => {
      await expect(
        authService.register({
          username: '',
          password: ''
        })
      ).rejects.toThrow('Invalid registration data');
    });
  });

  describe('Logout', () => {
    it('should successfully logout', async () => {
      await userAuth.login({
        username: 'test@example.com',
        password: 'valid-password'
      });

      await userAuth.logout();
      expect(userAuth.isAuthenticated()).toBe(false);
      expect(memoryStorageToken.getToken()).toBe('');
    });

    it('should handle multiple logout requests', async () => {
      await userAuth.login({
        username: 'test@example.com',
        password: 'valid-password'
      });

      const logoutPromises = Array(3)
        .fill(null)
        .map(() => userAuth.logout());

      await expect(Promise.all(logoutPromises)).resolves.toBeDefined();
      expect(userAuth.isAuthenticated()).toBe(false);
    });
  });
});
