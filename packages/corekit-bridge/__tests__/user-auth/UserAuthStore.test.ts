import { UserAuthStore } from '../../src/core/user-auth';
import { StorageTokenInterface } from '../../src/core/storage-token';
import { LOGIN_STATUS } from '../../src/core/user-auth';

// Mock user type for testing
interface MockUser {
  id: string;
  name: string;
  email: string;
}

// Mock storage token implementation
class MockStorageToken implements StorageTokenInterface<string> {
  private token: string = '';

  getToken(): string {
    return this.token;
  }

  setToken(token: string): void {
    this.token = token;
  }

  removeToken(): void {
    this.token = '';
  }
}

describe('UserAuthStore', () => {
  let store: UserAuthStore<MockUser>;
  let storageToken: MockStorageToken;

  beforeEach(() => {
    storageToken = new MockStorageToken();
    store = new UserAuthStore(storageToken);
  });

  describe('Token Management', () => {
    it('should initialize with empty token', () => {
      expect(store.getToken()).toBe('');
    });

    it('should set and get token', () => {
      const testToken = 'test-token';
      store.setToken(testToken);
      expect(store.getToken()).toBe(testToken);
      expect(storageToken.getToken()).toBe(testToken);
    });

    it('should initialize with token from storage', () => {
      const testToken = 'stored-token';
      storageToken.setToken(testToken);
      const newStore = new UserAuthStore(storageToken);
      expect(newStore.getToken()).toBe(testToken);
    });
  });

  describe('User Info Management', () => {
    const mockUser: MockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com'
    };

    it('should initialize with null user info', () => {
      expect(store.getUserInfo()).toBeNull();
    });

    it('should set and get user info', () => {
      store.setUserInfo(mockUser);
      expect(store.getUserInfo()).toEqual(mockUser);
    });

    it('should update user info', () => {
      store.setUserInfo(mockUser);
      const updatedUser = { ...mockUser, name: 'Updated User' };
      store.setUserInfo(updatedUser);
      expect(store.getUserInfo()).toEqual(updatedUser);
    });
  });

  describe('Login Status Management', () => {
    it('should initialize with null login status', () => {
      expect(store.getLoginStatus()).toBeNull();
    });

    it('should set and get login status', () => {
      store.changeLoginStatus(LOGIN_STATUS.LOADING);
      expect(store.getLoginStatus()).toBe(LOGIN_STATUS.LOADING);
    });

    it('should update login status', () => {
      store.changeLoginStatus(LOGIN_STATUS.LOADING);
      store.changeLoginStatus(LOGIN_STATUS.SUCCESS);
      expect(store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);
    });
  });

  describe('Store Reset', () => {
    const mockUser: MockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com'
    };

    beforeEach(() => {
      store.setToken('test-token');
      store.setUserInfo(mockUser);
      store.changeLoginStatus(LOGIN_STATUS.SUCCESS);
    });

    it('should reset all store values', () => {
      store.reset();
      expect(store.getToken()).toBe('test-token');
      expect(store.getUserInfo()).toBeNull();
      expect(store.getLoginStatus()).toBeNull();
    });

    it('should remove token from storage on reset', () => {
      store.reset();
      expect(storageToken.getToken()).toBe('');
    });
  });

  describe('Store without StorageToken', () => {
    let storeWithoutToken: UserAuthStore<MockUser>;

    beforeEach(() => {
      storeWithoutToken = new UserAuthStore();
    });

    it('should work without storage token', () => {
      const testToken = 'test-token';
      storeWithoutToken.setToken(testToken);
      expect(storeWithoutToken.getToken()).toBe(testToken);
    });

    it('should reset without storage token', () => {
      storeWithoutToken.setToken('test-token');
      storeWithoutToken.reset();
      expect(storeWithoutToken.getToken()).toBe('');
    });
  });
});
