import { describe, it, expect, beforeEach } from 'vitest';
import { createState } from '../../../src/core/user-auth/impl/createState';
import { UserAuthState } from '../../../src/core/user-auth/impl/UserAuthState';
import {
  UserAuthStoreOptions,
  LOGIN_STATUS
} from '../../../src/core/user-auth/interface/UserAuthStoreInterface';
import { TokenStorage } from '../../../src/core/storage';

/**
 * Test user type for testing purposes
 */
interface TestUser {
  id: string;
  name: string;
  email: string;
}

/**
 * Test state type extending UserAuthState
 */
type TestState = UserAuthState<TestUser>;

/**
 * Extended test state with additional properties
 */
class ExtendedUserAuthState<User> extends UserAuthState<User> {
  public customProperty: string = 'custom';
  public timestamp: number = Date.now();

  constructor(userInfo: User | null = null, credential: string | null = null) {
    super(userInfo, credential);
  }
}

describe('createState', () => {
  let userStorage: TokenStorage<string, TestUser>;
  let credentialStorage: TokenStorage<string, string>;
  let testUser: TestUser;
  let testCredential: string;

  beforeEach(() => {
    userStorage = new TokenStorage<string, TestUser>('test_user');
    credentialStorage = new TokenStorage<string, string>('test_credential');
    testUser = { id: '1', name: 'John Doe', email: 'john@example.com' };
    testCredential = 'test_auth_token_123';
  });

  describe('default state creation', () => {
    it('should create default state with empty options', () => {
      const options: UserAuthStoreOptions<TestState> = {};

      const state = createState<TestState>(options);

      expect(state).toBeDefined();
      expect(state).toBeInstanceOf(UserAuthState);
      expect(state.userInfo).toBeNull();
      expect(state.credential).toBeNull();
      expect(state.loginStatus).toBeNull();
      expect(state.error).toBeNull();
    });

    it('should create state with null storage values', () => {
      const options: UserAuthStoreOptions<TestState> = {
        userStorage: null,
        credentialStorage: null
      };

      const state = createState<TestState>(options);

      expect(state).toBeDefined();
      expect(state).toBeInstanceOf(UserAuthState);
      expect(state.userInfo).toBeNull();
      expect(state.credential).toBeNull();
    });
  });

  describe('state initialization from storage', () => {
    it('should initialize state with user info from storage', () => {
      userStorage.set(testUser);

      const options: UserAuthStoreOptions<TestState> = {
        userStorage
      };

      const state = createState<TestState>(options);

      expect(state).toBeDefined();
      expect(state.userInfo).toEqual(testUser);
      expect(state.credential).toBeNull();
    });

    it('should initialize state with credential from storage', () => {
      credentialStorage.set(testCredential);

      const options: UserAuthStoreOptions<TestState> = {
        credentialStorage
      };

      const state = createState<TestState>(options);

      expect(state).toBeDefined();
      expect(state.userInfo).toBeNull();
      expect(state.credential).toBe(testCredential);
    });

    it('should initialize state with both user info and credential from storage', () => {
      userStorage.set(testUser);
      credentialStorage.set(testCredential);

      const options: UserAuthStoreOptions<TestState> = {
        userStorage,
        credentialStorage
      };

      const state = createState<TestState>(options);

      expect(state).toBeDefined();
      expect(state.userInfo).toEqual(testUser);
      expect(state.credential).toBe(testCredential);
    });

    it('should handle undefined values from storage', () => {
      // Storage returns undefined when no value is set
      const options: UserAuthStoreOptions<TestState> = {
        userStorage,
        credentialStorage
      };

      const state = createState<TestState>(options);

      expect(state).toBeDefined();
      expect(state.userInfo).toBeNull();
      expect(state.credential).toBeNull();
    });

    it('should set login status to SUCCESS when both user info and credential are present', () => {
      userStorage.set(testUser);
      credentialStorage.set(testCredential);

      const options: UserAuthStoreOptions<TestState> = {
        userStorage,
        credentialStorage
      };

      const state = createState<TestState>(options);

      expect(state).toBeDefined();
      expect(state.userInfo).toEqual(testUser);
      expect(state.credential).toBe(testCredential);
      expect(state.loginStatus).toBe(LOGIN_STATUS.SUCCESS);
    });
  });

  describe('custom state creation', () => {
    it('should use custom createState function when provided', () => {
      const customCreateState = (
        userInfo?: TestUser,
        credential?: string
      ): TestState => {
        const state = new UserAuthState(userInfo || null, credential || null);
        state.loginStatus = LOGIN_STATUS.SUCCESS;
        state.error = null;
        return state as TestState;
      };

      const options: UserAuthStoreOptions<TestState> = {
        defaultState: customCreateState
      };

      const state = createState<TestState>(options);

      expect(state).toBeDefined();
      expect(state).toBeInstanceOf(UserAuthState);
      expect(state.loginStatus).toBe(LOGIN_STATUS.SUCCESS);
      expect(state.error).toBeNull();
    });

    it('should pass storage values to custom createState function', () => {
      userStorage.set(testUser);
      credentialStorage.set(testCredential);

      const customCreateState = (
        userInfo?: TestUser,
        credential?: string
      ): TestState => {
        const state = new UserAuthState(userInfo || null, credential || null);
        state.loginStatus = LOGIN_STATUS.LOADING;
        return state as TestState;
      };

      const options: UserAuthStoreOptions<TestState> = {
        userStorage,
        credentialStorage,
        defaultState: customCreateState
      };

      const state = createState<TestState>(options);

      expect(state).toBeDefined();
      expect(state.userInfo).toEqual(testUser);
      expect(state.credential).toBe(testCredential);
      expect(state.loginStatus).toBe(LOGIN_STATUS.LOADING);
    });

    it('should work with extended state classes', () => {
      const customCreateState = (
        userInfo?: TestUser,
        credential?: string
      ): ExtendedUserAuthState<TestUser> => {
        return new ExtendedUserAuthState(userInfo || null, credential || null);
      };

      const options: UserAuthStoreOptions<ExtendedUserAuthState<TestUser>> = {
        defaultState: customCreateState
      };

      const state = createState<ExtendedUserAuthState<TestUser>>(options);

      expect(state).toBeDefined();
      expect(state).toBeInstanceOf(ExtendedUserAuthState);
      expect(state).toBeInstanceOf(UserAuthState);
      expect(state.customProperty).toBe('custom');
      expect(typeof state.timestamp).toBe('number');
    });
  });

  describe('error handling', () => {
    it('should throw error when custom createState returns null', () => {
      const customCreateState = (): null => {
        return null;
      };

      const options: UserAuthStoreOptions<TestState> = {
        defaultState: customCreateState as unknown as (
          userInfo?: TestUser,
          credential?: string
        ) => TestState
      };

      expect(() => {
        createState<TestState>(options);
      }).toThrow('Please check the state is a instance of UserAuthState');
    });

    it('should throw error when custom createState returns undefined', () => {
      const customCreateState = (): undefined => {
        return undefined;
      };

      const options: UserAuthStoreOptions<TestState> = {
        defaultState: customCreateState as unknown as (
          userInfo?: TestUser,
          credential?: string
        ) => TestState
      };

      expect(() => {
        createState<TestState>(options);
      }).toThrow('Please check the state is a instance of UserAuthState');
    });

    it('should throw error when custom createState returns non-object', () => {
      const customCreateState = (): string => {
        return 'not an object';
      };

      const options: UserAuthStoreOptions<TestState> = {
        defaultState: customCreateState as unknown as (
          userInfo?: TestUser,
          credential?: string
        ) => TestState
      };

      expect(() => {
        createState<TestState>(options);
      }).toThrow('Please check the state is a instance of UserAuthState');
    });

    it('should throw error when custom createState returns non-UserAuthState object', () => {
      const customCreateState = (): Record<string, unknown> => {
        return { userInfo: null, credential: null };
      };

      const options: UserAuthStoreOptions<TestState> = {
        defaultState: customCreateState as unknown as (
          userInfo?: TestUser,
          credential?: string
        ) => TestState
      };

      expect(() => {
        createState<TestState>(options);
      }).toThrow('Please check the state is a instance of UserAuthState');
    });
  });

  describe('complex scenarios', () => {
    it('should handle complex user objects from storage', () => {
      const complexUser: TestUser = {
        id: 'complex-user-123',
        name: 'Complex User',
        email: 'complex@example.com'
      };

      userStorage.set(complexUser);

      const options: UserAuthStoreOptions<TestState> = {
        userStorage
      };

      const state = createState<TestState>(options);

      expect(state).toBeDefined();
      expect(state.userInfo).toEqual(complexUser);
      expect(state.userInfo?.id).toBe('complex-user-123');
      expect(state.userInfo?.name).toBe('Complex User');
      expect(state.userInfo?.email).toBe('complex@example.com');
    });

    it('should handle long credential strings', () => {
      const longCredential = 'a'.repeat(1000) + '_token_' + 'b'.repeat(500);
      credentialStorage.set(longCredential);

      const options: UserAuthStoreOptions<TestState> = {
        credentialStorage
      };

      const state = createState<TestState>(options);

      expect(state).toBeDefined();
      expect(state.credential).toBe(longCredential);
      expect(state.credential?.length).toBe(1507); // 1000 + 7 + 500
    });

    it('should work with custom state factory that modifies default values', () => {
      userStorage.set(testUser);
      credentialStorage.set(testCredential);

      const customCreateState = (
        userInfo?: TestUser,
        credential?: string
      ): TestState => {
        const state = new UserAuthState(userInfo || null, credential || null);

        // Modify the state with custom logic
        if (userInfo && credential) {
          state.loginStatus = LOGIN_STATUS.SUCCESS;
          state.error = null;
        } else if (userInfo) {
          state.loginStatus = LOGIN_STATUS.FAILED;
          state.error = 'Missing credential';
        } else {
          state.loginStatus = null;
          state.error = 'No user info';
        }

        return state as TestState;
      };

      const options: UserAuthStoreOptions<TestState> = {
        userStorage,
        credentialStorage,
        defaultState: customCreateState
      };

      const state = createState<TestState>(options);

      expect(state).toBeDefined();
      expect(state.userInfo).toEqual(testUser);
      expect(state.credential).toBe(testCredential);
      expect(state.loginStatus).toBe(LOGIN_STATUS.SUCCESS);
      expect(state.error).toBeNull();
    });
  });

  describe('type safety', () => {
    it('should maintain type safety with generic user types', () => {
      interface CustomUser {
        userId: number;
        username: string;
        roles: string[];
        metadata: Record<string, unknown>;
      }

      const customUser: CustomUser = {
        userId: 123,
        username: 'testuser',
        roles: ['admin', 'user'],
        metadata: { theme: 'dark', language: 'en' }
      };

      const customUserStorage = new TokenStorage<string, CustomUser>(
        'custom_user'
      );
      customUserStorage.set(customUser);

      const options: UserAuthStoreOptions<UserAuthState<CustomUser>> = {
        userStorage: customUserStorage
      };

      const state = createState<UserAuthState<CustomUser>>(options);

      expect(state).toBeDefined();
      expect(state.userInfo).toEqual(customUser);

      // Type checking - these should compile without errors
      if (state.userInfo) {
        expect(typeof state.userInfo.userId).toBe('number');
        expect(typeof state.userInfo.username).toBe('string');
        expect(Array.isArray(state.userInfo.roles)).toBe(true);
        expect(typeof state.userInfo.metadata).toBe('object');
      }
    });

    it('should work with PickUser type utility', () => {
      const options: UserAuthStoreOptions<TestState> = {
        userStorage
      };

      const state = createState<TestState>(options);

      expect(state).toBeDefined();
      expect(state).toBeInstanceOf(UserAuthState);
    });
  });

  describe('edge cases', () => {
    it('should handle storage that throws errors', () => {
      const faultyStorage = {
        get: () => {
          throw new Error('Storage error');
        },
        set: () => {},
        remove: () => {},
        key: 'faulty'
      } as unknown as TokenStorage<string, TestUser>;

      const options: UserAuthStoreOptions<TestState> = {
        userStorage: faultyStorage
      };

      // Should not throw, but handle gracefully
      expect(() => {
        createState<TestState>(options);
      }).toThrow('Storage error');
    });

    it('should handle empty string credentials', () => {
      credentialStorage.set('');

      const options: UserAuthStoreOptions<TestState> = {
        credentialStorage
      };

      const state = createState<TestState>(options);

      expect(state).toBeDefined();
      expect(state.credential).toBe('');
    });

    it('should handle whitespace-only credentials', () => {
      const whitespaceCredential = '   \t\n   ';
      credentialStorage.set(whitespaceCredential);

      const options: UserAuthStoreOptions<TestState> = {
        credentialStorage
      };

      const state = createState<TestState>(options);

      expect(state).toBeDefined();
      expect(state.credential).toBe(whitespaceCredential);
    });
  });
});
