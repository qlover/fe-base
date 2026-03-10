import type { UserCredentialSchema, UserSchema } from '@schemas/UserSchema';
import { EP_USER_INFO, EP_USER_LOGIN } from './endpoints/user';

export const mockData = {
  _default: {
    _isDefault: true
  },
  [EP_USER_LOGIN]: {
    access_token: 'mock-token-123123123',
    userId: 'mock-user-id-123123123',
    phoneNumber: 'mock-phone-number-123123123',
    nickname: 'mock-nickname-123123123',
    avatarUrl: 'mock-avatar-url-123123123'
  } as UserCredentialSchema,

  [EP_USER_INFO]: {
    id: 1,
    email: 'mock-email-123123123',
    name: 'mock-name-123123123',
    first_name: 'mock-first-name-123123123',
    last_name: 'mock-last-name-123123123',
    profile: {
      avatar_url: 'mock-avatar-url-123123123'
    },
    auth_token: {
      key: 'mock-token-123123123'
    }
  } as UserSchema
};
