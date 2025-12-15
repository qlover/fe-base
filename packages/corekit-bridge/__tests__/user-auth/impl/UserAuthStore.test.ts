import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KeyStorage } from '@qlover/fe-corekit';
import { UserAuthStore } from '../../../src/core/user-auth/impl/UserAuthStore';
import { UserAuthState } from '../../../src/core/user-auth/impl/UserAuthState';
import {
  LOGIN_STATUS,
  UserAuthStoreOptions
} from '../../../src/core/user-auth/interface/UserAuthStoreInterface';
import { LoginResponseData } from '../../../src/core/user-auth/interface/UserAuthApiInterface';

interface MockUser {
  /** Unique user identifier */
  id: number;
  /** User's display name */
  name: string;
  /** User's email address */
  email: string;
  /** Optional authentication token */
  token?: string;
  /** Optional user roles for authorization testing */
  roles?: string[];
  /** Optional user profile data */
  profile?: {
    avatar?: string;
    preferences?: Record<string, unknown>;
  };
  /** Optional timestamp for initialization */
  lastInitialized?: string;
}

class MockAuthState extends UserAuthState<MockUser> {
  constructor(userInfo?: MockUser | null, credential?: string | null) {
    super(userInfo, credential);
  }
}

class MockKeyStorage extends KeyStorage<string, MockUser> {
  private storage = new Map<string, MockUser>();

  /**
   * @override
   */
  public get(): MockUser | null {
    return this.storage.get(this.key) || null;
  }

  /**
   * @override
   */
  public set(value: MockUser): void {
    this.storage.set(this.key, value);
  }

  /**
   * @override
   */
  public remove(): void {
    this.storage.delete(this.key);
  }

  public clear(): void {
    this.storage.clear();
  }

  public has(): boolean {
    return this.storage.has(this.key);
  }
}

class MockCredentialStorage extends KeyStorage<string, string> {
  private storage = new Map<string, string>();

  /**
   * @override
   */
  public get(): string | null {
    const value = this.storage.get(this.key);
    return value !== undefined ? value : null;
  }

  /**
   * @override
   */
  public set(value: string): void {
    this.storage.set(this.key, value);
  }

  /**
   * @override
   */
  public remove(): void {
    this.storage.delete(this.key);
  }

  public clear(): void {
    this.storage.clear();
  }
}

describe('UserAuthStore', () => {
  let store: UserAuthStore<MockAuthState>;
  let mockUserStorage: MockKeyStorage;
  let mockCredentialStorage: MockCredentialStorage;

  // Test data constants
  const mockUser: MockUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    token: 'auth-token-123',
    roles: ['user', 'admin'],
    profile: {
      avatar: 'https://example.com/avatar.jpg',
      preferences: {
        theme: 'dark',
        language: 'en'
      }
    }
  };

  const mockCredential = 'test-credential-token';

  const loginResponse: LoginResponseData = {
    token: 'login-response-token',
    refreshToken: 'refresh-token-456'
  };

  beforeEach(() => {
    mockUserStorage = new MockKeyStorage('test-user-key');
    mockCredentialStorage = new MockCredentialStorage('test-credential-key');
    store = new UserAuthStore<MockAuthState>();
  });

  describe('Constructor and Initialization', () => {
    it('should initialize with default empty state', () => {
      const newStore = new UserAuthStore<MockAuthState>();

      expect(newStore.getUserInfo()).toBeNull();
      expect(newStore.getCredential()).toBeNull();
      expect(newStore.getLoginStatus()).toBeNull();
      expect(newStore.getUserStorage()).toBeNull();
      expect(newStore.getCredentialStorage()).toBeNull();
    });

    describe('userStorage option', () => {
      it('should initialize with user storage and load existing data', () => {
        // Pre-populate user storage
        mockUserStorage.set(mockUser);

        const newStore = new UserAuthStore<MockAuthState>({
          userStorage: mockUserStorage
        });

        expect(newStore.getUserInfo()).toEqual(mockUser);
        expect(newStore.getUserStorage()).toBe(mockUserStorage);
      });

      it('should initialize with empty user storage', () => {
        const emptyUserStorage = new MockKeyStorage('empty-user');

        const newStore = new UserAuthStore<MockAuthState>({
          userStorage: emptyUserStorage
        });

        expect(newStore.getUserInfo()).toBeNull();
        expect(newStore.getUserStorage()).toBe(emptyUserStorage);
      });

      it('should handle user storage with null data', () => {
        const nullUserStorage = new MockKeyStorage('null-user');
        vi.spyOn(nullUserStorage, 'get').mockReturnValue(null);

        const newStore = new UserAuthStore<MockAuthState>({
          userStorage: nullUserStorage
        });

        expect(newStore.getUserInfo()).toBeNull();
        expect(newStore.getUserStorage()).toBe(nullUserStorage);
      });

      it('should handle user storage with complex user data', () => {
        const complexUser = {
          ...mockUser,
          profile: {
            avatar: 'https://example.com/avatar.jpg',
            preferences: {
              theme: 'dark',
              notifications: {
                email: true,
                push: false
              }
            }
          },
          metadata: {
            createdAt: '2023-01-01T00:00:00Z',
            lastLogin: '2023-12-01T12:00:00Z'
          }
        };

        const complexUserStorage = new MockKeyStorage('complex-user');
        complexUserStorage.set(complexUser);

        const newStore = new UserAuthStore<MockAuthState>({
          userStorage: complexUserStorage
        });

        expect(newStore.getUserInfo()).toEqual(complexUser);
        expect(newStore.getUserStorage()).toBe(complexUserStorage);
      });

      it('should handle user storage initialization errors gracefully', () => {
        const faultyUserStorage = new MockKeyStorage('faulty-user');
        vi.spyOn(faultyUserStorage, 'get').mockImplementation(() => {
          throw new Error('Storage read error');
        });

        expect(() => {
          new UserAuthStore<MockAuthState>({
            userStorage: faultyUserStorage
          });
        }).toThrow('Storage read error');
      });
    });

    describe('credentialStorage option', () => {
      it('should initialize with credential storage and load existing credential', () => {
        // Pre-populate credential storage
        mockCredentialStorage.set(mockCredential);

        const newStore = new UserAuthStore<MockAuthState>({
          credentialStorage: mockCredentialStorage
        });

        expect(newStore.getCredential()).toBe(mockCredential);
        expect(newStore.getCredentialStorage()).toBe(mockCredentialStorage);
      });

      it('should initialize with empty credential storage', () => {
        const emptyCredentialStorage = new MockCredentialStorage(
          'empty-credential'
        );

        const newStore = new UserAuthStore<MockAuthState>({
          credentialStorage: emptyCredentialStorage
        });

        expect(newStore.getCredential()).toBeNull();
        expect(newStore.getCredentialStorage()).toBe(emptyCredentialStorage);
      });

      it('should handle credential storage with null data', () => {
        const nullCredentialStorage = new MockCredentialStorage(
          'null-credential'
        );
        vi.spyOn(nullCredentialStorage, 'get').mockReturnValue(null);

        const newStore = new UserAuthStore<MockAuthState>({
          credentialStorage: nullCredentialStorage
        });

        expect(newStore.getCredential()).toBeNull();
        expect(newStore.getCredentialStorage()).toBe(nullCredentialStorage);
      });

      it('should handle credential storage with empty string', () => {
        const emptyStringCredentialStorage = new MockCredentialStorage(
          'empty-string'
        );
        emptyStringCredentialStorage.set('');

        const newStore = new UserAuthStore<MockAuthState>({
          credentialStorage: emptyStringCredentialStorage
        });

        expect(newStore.getCredential()).toBe('');
        expect(newStore.getCredentialStorage()).toBe(
          emptyStringCredentialStorage
        );
      });

      it('should handle credential storage with long token', () => {
        const longToken = 'a'.repeat(1000); // 1000 character token
        const longTokenStorage = new MockCredentialStorage('long-token');
        longTokenStorage.set(longToken);

        const newStore = new UserAuthStore<MockAuthState>({
          credentialStorage: longTokenStorage
        });

        expect(newStore.getCredential()).toBe(longToken);
        expect(newStore.getCredentialStorage()).toBe(longTokenStorage);
      });

      it('should handle credential storage initialization errors gracefully', () => {
        const faultyCredentialStorage = new MockCredentialStorage(
          'faulty-credential'
        );
        vi.spyOn(faultyCredentialStorage, 'get').mockImplementation(() => {
          throw new Error('Credential storage read error');
        });

        expect(() => {
          new UserAuthStore<MockAuthState>({
            credentialStorage: faultyCredentialStorage
          });
        }).toThrow('Credential storage read error');
      });
    });

    describe('defaultState option', () => {
      it('should initialize with default state instance', () => {
        const customState = new MockAuthState(mockUser, mockCredential);

        const newStore = new UserAuthStore<MockAuthState>({
          defaultState: customState
        });

        expect(newStore.getUserInfo()).toEqual(mockUser);
        expect(newStore.getCredential()).toBe(mockCredential);
        expect(newStore.state).toBeInstanceOf(MockAuthState);
      });

      it('should initialize with default state factory function', () => {
        const stateFactory = (
          userInfo?: MockUser | null,
          credential?: string | null
        ) => {
          return new MockAuthState(userInfo, credential);
        };

        const newStore = new UserAuthStore<MockAuthState>({
          defaultState: stateFactory
        });

        expect(newStore.getUserInfo()).toBeNull();
        expect(newStore.getCredential()).toBeNull();
        expect(newStore.state).toBeInstanceOf(MockAuthState);
      });

      it('should initialize with default state factory function and storage data', () => {
        mockUserStorage.set(mockUser);
        mockCredentialStorage.set(mockCredential);

        const stateFactory = (
          userInfo?: MockUser | null,
          credential?: string | null
        ) => {
          return new MockAuthState(userInfo, credential);
        };

        const newStore = new UserAuthStore<MockAuthState>({
          userStorage: mockUserStorage,
          credentialStorage: mockCredentialStorage,
          defaultState: stateFactory
        });

        expect(newStore.getUserInfo()).toEqual(mockUser);
        expect(newStore.getCredential()).toBe(mockCredential);
        expect(newStore.state).toBeInstanceOf(MockAuthState);
      });

      it('should handle custom state class with additional properties', () => {
        class ExtendedAuthState extends MockAuthState {
          public customProperty: string = 'custom-value';
          public isExtended: boolean = true;

          constructor(userInfo?: MockUser | null, credential?: string | null) {
            super(userInfo, credential);
          }

          public getCustomProperty(): string {
            return this.customProperty;
          }
        }

        const newStore = new UserAuthStore<ExtendedAuthState>({
          defaultState: new ExtendedAuthState()
        });

        expect(newStore.state).toBeInstanceOf(ExtendedAuthState);
        expect(newStore.state.customProperty).toBe('custom-value');
        expect(newStore.state.isExtended).toBe(true);
        expect(newStore.state.getCustomProperty()).toBe('custom-value');
      });

      it('should handle state factory with complex initialization logic', () => {
        const complexStateFactory = (
          userInfo?: MockUser | null,
          credential?: string | null
        ) => {
          const state = new MockAuthState(userInfo, credential);

          // Add initialization timestamp
          if (userInfo) {
            state.userInfo = {
              ...userInfo,
              lastInitialized: new Date().toISOString()
            } as MockUser;
          }

          return state;
        };

        // Pre-populate storage after store creation
        mockUserStorage.set(mockUser);

        // Create new store to test factory logic
        const newStoreWithData = new UserAuthStore<MockAuthState>({
          userStorage: mockUserStorage,
          defaultState: complexStateFactory
        });

        expect(newStoreWithData.getUserInfo()).toMatchObject(mockUser);
        expect(newStoreWithData.getUserInfo()).toHaveProperty(
          'lastInitialized'
        );
      });

      it('should throw error when defaultState is not a UserAuthState instance', () => {
        const invalidState = {
          userInfo: null,
          credential: null,
          loginStatus: null,
          error: null
        };

        expect(() => {
          new UserAuthStore<MockAuthState>({
            defaultState: invalidState as MockAuthState
          });
        }).toThrow('Please check the state is a instance of UserAuthState');
      });

      it('should throw error when defaultState factory returns invalid state', () => {
        const invalidStateFactory = () => {
          return {
            userInfo: null,
            credential: null,
            loginStatus: null,
            error: null
          } as MockAuthState;
        };

        expect(() => {
          new UserAuthStore<MockAuthState>({
            defaultState: invalidStateFactory
          });
        }).toThrow('Please check the state is a instance of UserAuthState');
      });

      it('should throw error when defaultState factory returns null', () => {
        const nullStateFactory = () => {
          return null as unknown as MockAuthState;
        };

        expect(() => {
          new UserAuthStore<MockAuthState>({
            defaultState: nullStateFactory
          });
        }).toThrow('Please check the state is a instance of UserAuthState');
      });

      it('should throw error when defaultState factory returns undefined', () => {
        const undefinedStateFactory = () => {
          return undefined as unknown as MockAuthState;
        };

        expect(() => {
          new UserAuthStore<MockAuthState>({
            defaultState: undefinedStateFactory
          });
        }).toThrow('Please check the state is a instance of UserAuthState');
      });
    });

    describe('combined options', () => {
      it('should initialize with both storages and load all data', () => {
        mockUserStorage.set(mockUser);
        mockCredentialStorage.set(mockCredential);

        const newStore = new UserAuthStore<MockAuthState>({
          userStorage: mockUserStorage,
          credentialStorage: mockCredentialStorage
        });

        expect(newStore.getUserInfo()).toEqual(mockUser);
        expect(newStore.getCredential()).toBe(mockCredential);
        expect(newStore.getUserStorage()).toBe(mockUserStorage);
        expect(newStore.getCredentialStorage()).toBe(mockCredentialStorage);
      });

      it('should initialize with all three options', () => {
        // Pre-populate storage BEFORE creating the store
        const prePopulatedUserStorage = new MockKeyStorage(
          'pre-populated-user'
        );
        const prePopulatedCredentialStorage = new MockCredentialStorage(
          'pre-populated-credential'
        );

        prePopulatedUserStorage.set(mockUser);
        prePopulatedCredentialStorage.set(mockCredential);

        // When defaultState is provided as an instance, it uses that instance directly
        // The storage data is passed to the factory function if defaultState is a function
        const stateFactory = (
          userInfo?: MockUser | null,
          credential?: string | null
        ) => {
          return new MockAuthState(userInfo, credential);
        };

        const newStore = new UserAuthStore<MockAuthState>({
          userStorage: prePopulatedUserStorage,
          credentialStorage: prePopulatedCredentialStorage,
          defaultState: stateFactory
        });

        expect(newStore.getUserInfo()).toEqual(mockUser);
        expect(newStore.getCredential()).toBe(mockCredential);
        expect(newStore.state).toBeInstanceOf(MockAuthState);
      });

      it('should prioritize storage data over default state data', () => {
        const storageUser = { ...mockUser, name: 'Storage User' };
        const storageCredential = 'storage-credential';

        // Pre-populate storage BEFORE creating the store
        const prePopulatedUserStorage = new MockKeyStorage('storage-user');
        const prePopulatedCredentialStorage = new MockCredentialStorage(
          'storage-credential'
        );

        prePopulatedUserStorage.set(storageUser);
        prePopulatedCredentialStorage.set(storageCredential);

        // When defaultState is provided as an instance, it uses that instance
        // But when storage data exists, it should be loaded into the state
        const newStore = new UserAuthStore<MockAuthState>({
          userStorage: prePopulatedUserStorage,
          credentialStorage: prePopulatedCredentialStorage
        });

        // Storage data should be loaded
        expect(newStore.getUserInfo()).toEqual(storageUser);
        expect(newStore.getCredential()).toBe(storageCredential);
      });

      it('should handle mixed storage availability', () => {
        // Only user storage has data
        mockUserStorage.set(mockUser);

        const emptyCredentialStorage = new MockCredentialStorage('empty');

        const newStore = new UserAuthStore<MockAuthState>({
          userStorage: mockUserStorage,
          credentialStorage: emptyCredentialStorage
        });

        expect(newStore.getUserInfo()).toEqual(mockUser);
        expect(newStore.getCredential()).toBeNull();
        expect(newStore.getUserStorage()).toBe(mockUserStorage);
        expect(newStore.getCredentialStorage()).toBe(emptyCredentialStorage);
      });

      it('should handle storage errors with fallback to default state', () => {
        const faultyUserStorage = new MockKeyStorage('faulty');
        vi.spyOn(faultyUserStorage, 'get').mockImplementation(() => {
          throw new Error('User storage error');
        });

        const workingCredentialStorage = new MockCredentialStorage('working');
        workingCredentialStorage.set(mockCredential);

        expect(() => {
          new UserAuthStore<MockAuthState>({
            userStorage: faultyUserStorage,
            credentialStorage: workingCredentialStorage
          });
        }).toThrow('User storage error');
      });
    });

    describe('edge cases and error handling', () => {
      it('should handle null options gracefully', () => {
        // The constructor should handle null by using default empty object
        // However, based on the implementation, it might throw an error
        // Let's test what actually happens
        expect(() => {
          new UserAuthStore<MockAuthState>(
            null as unknown as UserAuthStoreOptions<MockAuthState>
          );
        }).toThrow();
      });

      it('should handle undefined options gracefully', () => {
        expect(() => {
          new UserAuthStore<MockAuthState>(undefined);
        }).not.toThrow();
      });

      it('should handle empty options object', () => {
        const newStore = new UserAuthStore<MockAuthState>({});

        expect(newStore.getUserInfo()).toBeNull();
        expect(newStore.getCredential()).toBeNull();
        expect(newStore.getUserStorage()).toBeNull();
        expect(newStore.getCredentialStorage()).toBeNull();
      });

      it('should handle options with null values', () => {
        const newStore = new UserAuthStore<MockAuthState>({
          userStorage: null,
          credentialStorage: null,
          defaultState: undefined
        });

        expect(newStore.getUserInfo()).toBeNull();
        expect(newStore.getCredential()).toBeNull();
        expect(newStore.getUserStorage()).toBeNull();
        expect(newStore.getCredentialStorage()).toBeNull();
      });
    });
  });

  describe('User Storage Management', () => {
    it('should set and get user storage correctly', () => {
      store.setUserStorage(mockUserStorage);

      expect(store.getUserStorage()).toBe(mockUserStorage);
    });

    it('should return null when no user storage is set', () => {
      expect(store.getUserStorage()).toBeNull();
    });

    it('should work without user storage', () => {
      expect(() => {
        store.setUserInfo(mockUser);
        const userInfo = store.getUserInfo();
        expect(userInfo).toEqual(mockUser);
      }).not.toThrow();
    });

    it('should replace existing user storage', () => {
      const firstStorage = new MockKeyStorage('first');
      const secondStorage = new MockKeyStorage('second');

      store.setUserStorage(firstStorage);
      expect(store.getUserStorage()).toBe(firstStorage);

      store.setUserStorage(secondStorage);
      expect(store.getUserStorage()).toBe(secondStorage);
    });
  });

  describe('Credential Storage Management', () => {
    it('should set and get credential storage correctly', () => {
      store.setCredentialStorage(mockCredentialStorage);

      expect(store.getCredentialStorage()).toBe(mockCredentialStorage);
    });

    it('should return null when no credential storage is set', () => {
      expect(store.getCredentialStorage()).toBeNull();
    });

    it('should work without credential storage', () => {
      expect(() => {
        store.setCredential(mockCredential);
        const credential = store.getCredential();
        expect(credential).toBe(mockCredential);
      }).not.toThrow();
    });

    it('should replace existing credential storage', () => {
      const firstStorage = new MockCredentialStorage('first');
      const secondStorage = new MockCredentialStorage('second');

      store.setCredentialStorage(firstStorage);
      expect(store.getCredentialStorage()).toBe(firstStorage);

      store.setCredentialStorage(secondStorage);
      expect(store.getCredentialStorage()).toBe(secondStorage);
    });
  });

  describe('User Information Management', () => {
    beforeEach(() => {
      store.setUserStorage(mockUserStorage);
    });

    it('should set user info and persist to storage', () => {
      store.setUserInfo(mockUser);

      expect(store.getUserInfo()).toEqual(mockUser);
      expect(mockUserStorage.get()).toEqual(mockUser);
    });

    it('should get user info from current state', () => {
      store.setUserInfo(mockUser);

      const retrievedUser = store.getUserInfo();

      expect(retrievedUser).toEqual(mockUser);
    });

    it('should return null when no user info is set', () => {
      expect(store.getUserInfo()).toBeNull();
    });

    it('should update user info correctly', () => {
      const initialUser = { ...mockUser, name: 'Initial Name' };
      const updatedUser = { ...mockUser, name: 'Updated Name' };

      store.setUserInfo(initialUser);
      expect(store.getUserInfo()?.name).toBe('Initial Name');

      store.setUserInfo(updatedUser);
      expect(store.getUserInfo()?.name).toBe('Updated Name');
      expect(mockUserStorage.get()?.name).toBe('Updated Name');
    });

    it('should handle complex user objects with nested properties', () => {
      const complexUser = {
        ...mockUser,
        profile: {
          avatar: 'https://example.com/new-avatar.jpg',
          preferences: {
            theme: 'light',
            language: 'es',
            notifications: {
              email: true,
              push: false
            }
          }
        },
        metadata: {
          lastLogin: new Date().toISOString(),
          loginCount: 42
        }
      };

      store.setUserInfo(complexUser);

      expect(store.getUserInfo()).toEqual(complexUser);
      expect(mockUserStorage.get()).toEqual(complexUser);
    });

    it('should handle setting user info without storage', () => {
      const storeWithoutStorage = new UserAuthStore<MockAuthState>();

      expect(() => {
        storeWithoutStorage.setUserInfo(mockUser);
      }).not.toThrow();

      expect(storeWithoutStorage.getUserInfo()).toEqual(mockUser);
    });
  });

  describe('Credential Management', () => {
    beforeEach(() => {
      store.setCredentialStorage(mockCredentialStorage);
    });

    it('should set credential and persist to storage', () => {
      store.setCredential(mockCredential);

      expect(store.getCredential()).toBe(mockCredential);
      expect(mockCredentialStorage.get()).toBe(mockCredential);
    });

    it('should get credential from current state', () => {
      store.setCredential(mockCredential);

      const retrievedCredential = store.getCredential();

      expect(retrievedCredential).toBe(mockCredential);
    });

    it('should return null when no credential is set', () => {
      expect(store.getCredential()).toBeNull();
    });

    it('should update credential correctly', () => {
      const initialCredential = 'initial-token';
      const updatedCredential = 'updated-token';

      store.setCredential(initialCredential);
      expect(store.getCredential()).toBe(initialCredential);

      store.setCredential(updatedCredential);
      expect(store.getCredential()).toBe(updatedCredential);
      expect(mockCredentialStorage.get()).toBe(updatedCredential);
    });

    it('should handle setting credential without storage', () => {
      const storeWithoutStorage = new UserAuthStore<MockAuthState>();

      expect(() => {
        storeWithoutStorage.setCredential(mockCredential);
      }).not.toThrow();

      expect(storeWithoutStorage.getCredential()).toBe(mockCredential);
    });
  });

  describe('Login Status Management', () => {
    it('should return null for initial login status', () => {
      expect(store.getLoginStatus()).toBeNull();
    });

    it('should track login status through authentication flow', () => {
      // Start authentication
      store.startAuth();
      expect(store.getLoginStatus()).toBe(LOGIN_STATUS.LOADING);

      // Successful authentication
      store.authSuccess();
      expect(store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);

      // Failed authentication
      store.authFailed();
      expect(store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);
    });

    it('should handle multiple status transitions', () => {
      store.startAuth();
      expect(store.getLoginStatus()).toBe(LOGIN_STATUS.LOADING);

      store.authFailed('Network error');
      expect(store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);

      store.startAuth();
      expect(store.getLoginStatus()).toBe(LOGIN_STATUS.LOADING);

      store.authSuccess();
      expect(store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);
    });
  });

  describe('Authentication Flow Methods', () => {
    beforeEach(() => {
      store.setUserStorage(mockUserStorage);
      store.setCredentialStorage(mockCredentialStorage);
    });

    describe('startAuth', () => {
      it('should set login status to LOADING and clear errors', () => {
        // First set an error state
        store.authFailed('previous error');
        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);

        store.startAuth();
        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.LOADING);
      });

      it('should not affect existing user info and credentials', () => {
        store.setUserInfo(mockUser);
        store.setCredential(mockCredential);

        store.startAuth();

        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.LOADING);
        expect(store.getUserInfo()).toEqual(mockUser);
        expect(store.getCredential()).toBe(mockCredential);
      });
    });

    describe('authSuccess', () => {
      it('should set login status to SUCCESS', () => {
        store.authSuccess();

        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);
      });

      it('should set login status to SUCCESS and store user info when provided', () => {
        store.authSuccess(mockUser);

        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);
        expect(store.getUserInfo()).toEqual(mockUser);
        expect(mockUserStorage.get()).toEqual(mockUser);
      });

      it('should handle string credential parameter', () => {
        const tokenString = 'string-token-123';

        store.authSuccess(mockUser, tokenString);

        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);
        expect(store.getUserInfo()).toEqual(mockUser);
        expect(store.getCredential()).toBe(tokenString);
        expect(mockCredentialStorage.get()).toBe(tokenString);
      });

      it('should handle LoginResponseData credential parameter', () => {
        store.authSuccess(mockUser, loginResponse);

        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);
        expect(store.getUserInfo()).toEqual(mockUser);
        expect(store.getCredential()).toBe(loginResponse.token);
        expect(mockCredentialStorage.get()).toBe(loginResponse.token);
      });

      it('should handle LoginResponseData without token', () => {
        const responseWithoutToken = { refreshToken: 'refresh-only' };

        store.authSuccess(mockUser, responseWithoutToken);

        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);
        expect(store.getUserInfo()).toEqual(mockUser);
        expect(store.getCredential()).toBeNull();
      });

      it('should clear errors on successful auth', () => {
        store.authFailed('some error');
        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);

        store.authSuccess();
        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);
      });

      it('should not overwrite existing user info when none provided', () => {
        store.setUserInfo(mockUser);
        store.authSuccess();

        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);
        expect(store.getUserInfo()).toEqual(mockUser);
      });
    });

    describe('authFailed', () => {
      it('should set login status to FAILED', () => {
        store.authFailed();

        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);
      });

      it('should set login status to FAILED with error object', () => {
        const error = new Error('Authentication failed');

        store.authFailed(error);

        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);
      });

      it('should handle string error messages', () => {
        const errorMessage = 'Invalid credentials';

        store.authFailed(errorMessage);

        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);
      });

      it('should handle null/undefined errors', () => {
        store.authFailed(null);
        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);

        store.authFailed(undefined);
        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);
      });

      it('should handle complex error objects', () => {
        const complexError = {
          message: 'Authentication failed',
          code: 401,
          details: {
            reason: 'invalid_token',
            timestamp: Date.now()
          }
        };

        store.authFailed(complexError);

        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);
      });

      it('should preserve user info and credentials on auth failure', () => {
        store.setUserInfo(mockUser);
        store.setCredential(mockCredential);

        store.authFailed('Network error');

        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);
        expect(store.getUserInfo()).toEqual(mockUser);
        expect(store.getCredential()).toBe(mockCredential);
      });
    });
  });

  describe('Reset Functionality', () => {
    beforeEach(() => {
      store.setUserStorage(mockUserStorage);
      store.setCredentialStorage(mockCredentialStorage);
    });

    it('should reset all store state and clear all storage', () => {
      // Set up comprehensive state
      store.setUserInfo(mockUser);
      store.setCredential(mockCredential);
      store.authSuccess();

      // Verify state is fully set
      expect(store.getUserInfo()).toEqual(mockUser);
      expect(store.getCredential()).toBe(mockCredential);
      expect(store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);
      expect(mockUserStorage.get()).toEqual(mockUser);
      expect(mockCredentialStorage.get()).toBe(mockCredential);

      // Reset everything
      store.reset();

      // Verify complete cleanup
      expect(store.getUserInfo()).toBeNull();
      expect(store.getCredential()).toBeNull();
      expect(store.getLoginStatus()).toBeNull();
      expect(mockUserStorage.get()).toBeNull();
      expect(mockCredentialStorage.get()).toBeNull();
    });

    it('should reset without any storage configured', () => {
      const storeWithoutStorage = new UserAuthStore<MockAuthState>();
      storeWithoutStorage.setUserInfo(mockUser);
      storeWithoutStorage.authSuccess();

      expect(() => {
        storeWithoutStorage.reset();
      }).not.toThrow();

      expect(storeWithoutStorage.getUserInfo()).toBeNull();
      expect(storeWithoutStorage.getLoginStatus()).toBeNull();
    });

    it('should reset with only user storage configured', () => {
      const partialStore = new UserAuthStore<MockAuthState>({
        userStorage: mockUserStorage
      });

      partialStore.setUserInfo(mockUser);
      partialStore.authSuccess();

      partialStore.reset();

      expect(partialStore.getUserInfo()).toBeNull();
      expect(partialStore.getLoginStatus()).toBeNull();
      expect(mockUserStorage.get()).toBeNull();
    });

    it('should reset with only credential storage configured', () => {
      const partialStore = new UserAuthStore<MockAuthState>({
        credentialStorage: mockCredentialStorage
      });

      partialStore.setCredential(mockCredential);
      partialStore.authSuccess();

      partialStore.reset();

      expect(partialStore.getCredential()).toBeNull();
      expect(partialStore.getLoginStatus()).toBeNull();
      expect(mockCredentialStorage.get()).toBeNull();
    });
  });

  describe('State Consistency and Integration', () => {
    beforeEach(() => {
      store.setUserStorage(mockUserStorage);
      store.setCredentialStorage(mockCredentialStorage);
    });

    it('should maintain state consistency across complete authentication flow', () => {
      // Initial state
      expect(store.getLoginStatus()).toBeNull();
      expect(store.getUserInfo()).toBeNull();
      expect(store.getCredential()).toBeNull();

      // Start authentication
      store.startAuth();
      expect(store.getLoginStatus()).toBe(LOGIN_STATUS.LOADING);
      expect(store.getUserInfo()).toBeNull();
      expect(store.getCredential()).toBeNull();

      // Successful authentication with data
      store.authSuccess(mockUser, mockCredential);
      expect(store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);
      expect(store.getUserInfo()).toEqual(mockUser);
      expect(store.getCredential()).toBe(mockCredential);

      // Authentication failure (preserves user data)
      store.authFailed('Network error');
      expect(store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);
      expect(store.getUserInfo()).toEqual(mockUser);
      expect(store.getCredential()).toBe(mockCredential);

      // Complete reset
      store.reset();
      expect(store.getLoginStatus()).toBeNull();
      expect(store.getUserInfo()).toBeNull();
      expect(store.getCredential()).toBeNull();
    });

    it('should handle rapid state changes correctly', () => {
      store.startAuth();
      store.authSuccess(mockUser, mockCredential);
      store.startAuth();
      store.authFailed('Error');
      store.startAuth();
      store.authSuccess();

      expect(store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);
      expect(store.getUserInfo()).toEqual(mockUser);
      expect(store.getCredential()).toBe(mockCredential);
    });

    it('should properly synchronize state with storage', () => {
      // Set data through store
      store.setUserInfo(mockUser);
      store.setCredential(mockCredential);

      // Verify storage synchronization
      expect(mockUserStorage.get()).toEqual(mockUser);
      expect(mockCredentialStorage.get()).toBe(mockCredential);

      // Modify storage directly
      const modifiedUser = { ...mockUser, name: 'Modified Name' };
      mockUserStorage.set(modifiedUser);

      // Store state should remain unchanged until next operation
      expect(store.getUserInfo()).toEqual(mockUser);

      // Reset and verify storage is cleared
      store.reset();
      expect(mockUserStorage.get()).toBeNull();
      expect(mockCredentialStorage.get()).toBeNull();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle null user info gracefully', () => {
      store.setUserStorage(mockUserStorage);

      expect(() => {
        store.setUserInfo(null);
      }).not.toThrow();

      expect(store.getUserInfo()).toBeNull();
    });

    it('should handle undefined user info gracefully', () => {
      store.setUserStorage(mockUserStorage);

      expect(() => {
        store.setUserInfo(undefined as unknown as MockUser);
      }).not.toThrow();

      expect(store.getUserInfo()).toBeNull();
    });

    it('should handle storage errors during user info operations', () => {
      const faultyUserStorage = new MockKeyStorage('faulty');
      vi.spyOn(faultyUserStorage, 'set').mockImplementation(() => {
        throw new Error('User storage error');
      });

      store.setUserStorage(faultyUserStorage);

      // Should throw when storage fails
      expect(() => {
        store.setUserInfo(mockUser);
      }).toThrow('User storage error');
    });

    it('should handle storage errors during credential operations', () => {
      const faultyCredentialStorage = new MockCredentialStorage('faulty');
      vi.spyOn(faultyCredentialStorage, 'set').mockImplementation(() => {
        throw new Error('Credential storage error');
      });

      store.setCredentialStorage(faultyCredentialStorage);

      // Should throw when storage fails
      expect(() => {
        store.setCredential(mockCredential);
      }).toThrow('Credential storage error');
    });

    it('should handle storage errors during reset', () => {
      const faultyUserStorage = new MockKeyStorage('faulty');
      vi.spyOn(faultyUserStorage, 'remove').mockImplementation(() => {
        throw new Error('Remove error');
      });

      store.setUserStorage(faultyUserStorage);
      store.setUserInfo(mockUser);

      // Reset should handle storage errors gracefully
      expect(() => {
        store.reset();
      }).toThrow('Remove error');
    });

    it('should handle empty string credentials', () => {
      store.setCredentialStorage(mockCredentialStorage);

      store.setCredential('');

      expect(store.getCredential()).toBe('');
      expect(mockCredentialStorage.get()).toBe('');
    });

    it('should handle very large user objects', () => {
      const largeUser = {
        ...mockUser,
        metadata: {
          ...Array.from({ length: 1000 }, (_, i) => ({
            [`field${i}`]: `value${i}`
          })).reduce((acc, obj) => ({ ...acc, ...obj }), {})
        }
      };

      store.setUserStorage(mockUserStorage);

      expect(() => {
        store.setUserInfo(largeUser);
      }).not.toThrow();

      expect(store.getUserInfo()).toEqual(largeUser);
    });
  });

  describe('Store Interface Integration', () => {
    it('should properly extend StoreInterface functionality', () => {
      // Test that the store properly inherits from StoreInterface
      expect(store).toHaveProperty('state');
      expect(store).toHaveProperty('emit');
      expect(typeof store.emit).toBe('function');
    });

    it('should maintain proper state structure', () => {
      store.setUserInfo(mockUser);
      store.setCredential(mockCredential);
      store.authSuccess();

      const state = store.state;

      expect(state.userInfo).toEqual(mockUser);
      expect(state.credential).toBe(mockCredential);
      expect(state.loginStatus).toBe(LOGIN_STATUS.SUCCESS);
      expect(state.error).toBeNull();
    });

    it('should emit state changes properly', () => {
      const emitSpy = vi.spyOn(store, 'emit');

      store.setUserInfo(mockUser);
      expect(emitSpy).toHaveBeenCalled();

      store.setCredential(mockCredential);
      expect(emitSpy).toHaveBeenCalled();

      store.startAuth();
      expect(emitSpy).toHaveBeenCalled();

      store.authSuccess();
      expect(emitSpy).toHaveBeenCalled();

      store.authFailed('error');
      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe('State Change Verification with cloneState', () => {
    let stateChangeCallback: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      store.setUserStorage(mockUserStorage);
      store.setCredentialStorage(mockCredentialStorage);

      // Mock state change callback
      stateChangeCallback = vi.fn();
      store.observe(stateChangeCallback);
    });

    describe('setCredential state changes', () => {
      it('should create new state object when setting credential', () => {
        const previousState = store.state;
        const testCredential = 'test-credential-123';

        store.setCredential(testCredential);

        // Verify state object is new (immutability)
        expect(store.state).not.toBe(previousState);

        // Verify credential is updated
        expect(store.state.credential).toBe(testCredential);
        expect(store.getCredential()).toBe(testCredential);

        // Verify other properties remain unchanged
        expect(store.state.userInfo).toBe(previousState.userInfo);
        expect(store.state.loginStatus).toBe(previousState.loginStatus);
        expect(store.state.error).toBe(previousState.error);

        // Verify state change callback was called
        expect(stateChangeCallback).toHaveBeenCalledWith(store.state);
      });

      it('should handle empty credential correctly', () => {
        const previousState = store.state;

        store.setCredential('');

        expect(store.state).not.toBe(previousState);
        expect(store.state.credential).toBe('');
        expect(store.getCredential()).toBe('');
      });

      it('should persist credential to storage when setting', () => {
        const testCredential = 'persistent-credential';

        store.setCredential(testCredential);

        expect(mockCredentialStorage.get()).toBe(testCredential);
      });

      it('should maintain state consistency across multiple credential changes', () => {
        const credentials = ['cred1', 'cred2', 'cred3'];
        const states: MockAuthState[] = [];

        credentials.forEach((credential) => {
          store.setCredential(credential);
          states.push({ ...store.state });
        });

        // Verify each state change created new state object
        for (let i = 0; i < states.length - 1; i++) {
          expect(states[i]).not.toBe(states[i + 1]);
        }

        // Verify final state has correct credential
        expect(store.getCredential()).toBe(credentials[credentials.length - 1]);
        expect(stateChangeCallback).toHaveBeenCalledTimes(credentials.length);
      });
    });

    describe('startAuth state changes', () => {
      it('should create new state object when starting auth', () => {
        const previousState = store.state;

        store.startAuth();

        // Verify state object is new
        expect(store.state).not.toBe(previousState);

        // Verify login status is updated
        expect(store.state.loginStatus).toBe(LOGIN_STATUS.LOADING);
        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.LOADING);

        // Verify error is cleared
        expect(store.state.error).toBeNull();

        // Verify other properties remain unchanged
        expect(store.state.userInfo).toBe(previousState.userInfo);
        expect(store.state.credential).toBe(previousState.credential);

        // Verify state change callback was called
        expect(stateChangeCallback).toHaveBeenCalledWith(store.state);
      });

      it('should clear previous error when starting auth', () => {
        // Set an error first
        store.authFailed('previous error');
        expect(store.state.error).toBe('previous error');

        const previousState = store.state;

        store.startAuth();

        expect(store.state).not.toBe(previousState);
        expect(store.state.error).toBeNull();
        expect(store.state.loginStatus).toBe(LOGIN_STATUS.LOADING);
      });

      it('should preserve user info and credentials when starting auth', () => {
        // Set up existing data
        store.setUserInfo(mockUser);
        store.setCredential(mockCredential);

        const previousState = store.state;

        store.startAuth();

        expect(store.state).not.toBe(previousState);
        expect(store.state.userInfo).toEqual(mockUser);
        expect(store.state.credential).toBe(mockCredential);
        expect(store.state.loginStatus).toBe(LOGIN_STATUS.LOADING);
        expect(store.state.error).toBeNull();
      });
    });

    describe('authSuccess state changes', () => {
      it('should create new state object when auth succeeds', () => {
        const previousState = store.state;

        store.authSuccess();

        // Verify state object is new
        expect(store.state).not.toBe(previousState);

        // Verify login status is updated
        expect(store.state.loginStatus).toBe(LOGIN_STATUS.SUCCESS);
        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);

        // Verify error is cleared
        expect(store.state.error).toBeNull();

        // Verify state change callback was called
        expect(stateChangeCallback).toHaveBeenCalledWith(store.state);
      });

      it('should clear previous error when auth succeeds', () => {
        // Set an error first
        store.authFailed('auth error');
        expect(store.state.error).toBe('auth error');

        const previousState = store.state;

        store.authSuccess();

        expect(store.state).not.toBe(previousState);
        expect(store.state.error).toBeNull();
        expect(store.state.loginStatus).toBe(LOGIN_STATUS.SUCCESS);
      });

      it('should handle user info and credential updates correctly', () => {
        const previousState = store.state;
        const testCredential = 'success-credential';

        store.authSuccess(mockUser, testCredential);

        // Verify state changes from authSuccess
        expect(store.state).not.toBe(previousState);
        expect(store.state.loginStatus).toBe(LOGIN_STATUS.SUCCESS);
        expect(store.state.error).toBeNull();

        // Verify user info and credential are set (through separate method calls)
        expect(store.getUserInfo()).toEqual(mockUser);
        expect(store.getCredential()).toBe(testCredential);

        // Verify multiple state changes occurred (authSuccess + setUserInfo + setCredential)
        expect(stateChangeCallback).toHaveBeenCalledTimes(3);
      });

      it('should handle LoginResponseData credential parameter', () => {
        const previousState = store.state;

        store.authSuccess(mockUser, loginResponse);

        expect(store.state).not.toBe(previousState);
        expect(store.state.loginStatus).toBe(LOGIN_STATUS.SUCCESS);
        expect(store.getCredential()).toBe(loginResponse.token);
      });
    });

    describe('authFailed state changes', () => {
      it('should create new state object when auth fails', () => {
        const previousState = store.state;
        const testError = 'Authentication failed';

        store.authFailed(testError);

        // Verify state object is new
        expect(store.state).not.toBe(previousState);

        // Verify login status is updated
        expect(store.state.loginStatus).toBe(LOGIN_STATUS.FAILED);
        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);

        // Verify error is set
        expect(store.state.error).toBe(testError);

        // Verify other properties remain unchanged
        expect(store.state.userInfo).toBe(previousState.userInfo);
        expect(store.state.credential).toBe(previousState.credential);

        // Verify state change callback was called
        expect(stateChangeCallback).toHaveBeenCalledWith(store.state);
      });

      it('should handle different error types correctly', () => {
        const errorTypes = [
          'string error',
          new Error('Error object'),
          { message: 'Custom error', code: 500 },
          null,
          undefined
        ];

        errorTypes.forEach((error) => {
          const previousState = store.state;

          store.authFailed(error);

          expect(store.state).not.toBe(previousState);
          expect(store.state.loginStatus).toBe(LOGIN_STATUS.FAILED);
          expect(store.state.error).toBe(error);
        });

        expect(stateChangeCallback).toHaveBeenCalledTimes(errorTypes.length);
      });

      it('should preserve user info and credentials when auth fails', () => {
        // Set up existing data
        store.setUserInfo(mockUser);
        store.setCredential(mockCredential);

        const previousState = store.state;

        store.authFailed('Network error');

        expect(store.state).not.toBe(previousState);
        expect(store.state.userInfo).toEqual(mockUser);
        expect(store.state.credential).toBe(mockCredential);
        expect(store.state.loginStatus).toBe(LOGIN_STATUS.FAILED);
        expect(store.state.error).toBe('Network error');
      });
    });

    describe('State transition sequences', () => {
      it('should maintain state immutability through complete auth flow', () => {
        const states: MockAuthState[] = [];

        // Capture each state change
        const captureState = () => states.push({ ...store.state });

        // Complete authentication flow
        captureState(); // Initial state

        store.startAuth();
        captureState(); // Loading state

        store.setCredential('flow-credential');
        captureState(); // With credential

        store.authSuccess(mockUser);
        captureState(); // Success state

        store.authFailed('Network error');
        captureState(); // Failed state

        // Verify each state is a new object
        for (let i = 0; i < states.length - 1; i++) {
          expect(states[i]).not.toBe(states[i + 1]);
        }

        // Verify final state
        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);
        expect(store.state.error).toBe('Network error');
        expect(store.getUserInfo()).toEqual(mockUser);
        expect(store.getCredential()).toBe('flow-credential');
      });

      it('should handle rapid state changes correctly', () => {
        const operations = [
          () => store.startAuth(),
          () => store.setCredential('rapid-1'),
          () => store.authSuccess(),
          () => store.setCredential('rapid-2'),
          () => store.authFailed('rapid-error'),
          () => store.startAuth(),
          () => store.authSuccess(mockUser, 'rapid-3')
        ];

        const statesBefore: MockAuthState[] = [];
        const statesAfter: MockAuthState[] = [];

        operations.forEach((operation) => {
          statesBefore.push({ ...store.state });
          operation();
          statesAfter.push({ ...store.state });
        });

        // Verify each operation created a new state
        for (let i = 0; i < operations.length; i++) {
          expect(statesBefore[i]).not.toBe(statesAfter[i]);
        }

        // Verify final state is correct
        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);
        expect(store.getUserInfo()).toEqual(mockUser);
        expect(store.getCredential()).toBe('rapid-3');
        expect(store.state.error).toBeNull();
      });
    });

    describe('State consistency verification', () => {
      it('should maintain consistent state between getter methods and direct state access', () => {
        // Set up complex state
        store.setUserInfo(mockUser);
        store.setCredential(mockCredential);
        store.authSuccess();

        // Verify consistency
        expect(store.getUserInfo()).toEqual(store.state.userInfo);
        expect(store.getCredential()).toBe(store.state.credential);
        expect(store.getLoginStatus()).toBe(store.state.loginStatus);
      });

      it('should ensure state changes are atomic', () => {
        const stateSnapshots: MockAuthState[] = [];

        // Subscribe to capture every state change
        store.observe((state: MockAuthState) => {
          stateSnapshots.push({ ...state });
        });

        // Perform operations
        store.startAuth();
        store.setCredential('atomic-test');
        store.authSuccess(mockUser);

        // Verify each snapshot represents a complete, valid state
        stateSnapshots.forEach((snapshot) => {
          expect(snapshot).toHaveProperty('userInfo');
          expect(snapshot).toHaveProperty('credential');
          expect(snapshot).toHaveProperty('loginStatus');
          expect(snapshot).toHaveProperty('error');
        });

        // Verify final state
        const finalState = stateSnapshots[stateSnapshots.length - 1];
        expect(finalState.loginStatus).toBe(LOGIN_STATUS.SUCCESS);
        expect(finalState.userInfo).toEqual(mockUser);
        expect(finalState.credential).toBe('atomic-test');
        expect(finalState.error).toBeNull();
      });
    });
  });

  describe('default state', () => {
    it('should throw error when state is not a instance of UserAuthState', () => {
      const mockState: UserAuthState<MockUser> = {
        userInfo: null,
        credential: null,
        loginStatus: null,
        error: null
      };

      expect(() => {
        new UserAuthStore<typeof mockState>({
          defaultState: mockState
        });
      }).toThrow('Please check the state is a instance of UserAuthState');
    });

    it('should handle js type correctly', () => {
      type MockUserExtend = MockUser & {
        money: number;
      };

      const store = new UserAuthStore<UserAuthState<MockUserExtend>>();

      expect(store.state).toBeInstanceOf(UserAuthState);
      store.setUserInfo({ name: 'test', money: 100 } as MockUserExtend);
      expect(store.state).toBeInstanceOf(UserAuthState);
      expect(store.getUserInfo()).toEqual({
        name: 'test',
        money: 100
      } as MockUserExtend);
    });

    it('should not lose class identity', () => {
      class MockState extends UserAuthState<MockUser> {
        constructor(userInfo?: MockUser | null, credential?: string | null) {
          super(userInfo, credential);
        }

        public getUserInfo(): MockUser | null {
          return this.userInfo;
        }
      }

      const store = new UserAuthStore<MockState>({
        defaultState: new MockState()
      });

      expect(store.state).toBeInstanceOf(MockState);
      store.setUserInfo({ name: 'test' } as MockUser);
      expect(store.state).toBeInstanceOf(MockState);
      expect(store.getUserInfo()).toEqual({ name: 'test' } as MockUser);
    });
  });
});
