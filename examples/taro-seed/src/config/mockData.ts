import { EP_LOGIN_WX, EP_USER_INFO } from './endpotins';
import type {
  UserCredentialSchema,
  UserSchema
} from 'types/schemas/UserSchema';

export const mockData = {
  _default: {
    _isDefault: true
  },
  [EP_LOGIN_WX]: {
    access_token: 'mock-token-123123123',
    userId: 'mock-user-id-123123123',
    phoneNumber: 'mock-phone-number-123123123',
    nickname: 'mock-nickname-123123123',
    avatarUrl: 'mock-avatar-url-123123123'
  } as UserCredentialSchema,

  [EP_USER_INFO]: {
    userId: 'mock-user-id-123123123',
    phoneNumber: 'mock-phone-number-123123123',
    nickname: 'mock-nickname-123123123',
    avatarUrl: 'mock-avatar-url-123123123'
  } as UserSchema
};
