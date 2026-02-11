import { prefixEndpointWithMock } from '@config/endpoints/_endpoint';
import {
  EP_USER_INFO,
  EP_USER_LOGIN,
  EP_USER_REGISTER
} from '@config/endpoints/user';

const authKey = 'Authorization';
export default [
  {
    ...prefixEndpointWithMock(EP_USER_INFO),
    response({ headers }: { headers: Record<string, string> }) {
      const token = headers[authKey] || headers[authKey.toLowerCase()];
      if (!token) {
        return null;
      }

      return {
        id: 1,
        role: 1,
        email: 'test@example.com',
        credential_token: 'mock-token-info',
        email_confirmed_at: 1717702400,
        created_at: new Date(),
        updated_at: new Date()
      };
    }
  },
  {
    ...prefixEndpointWithMock(EP_USER_LOGIN),
    timeout: 500,
    response() {
      return { token: 'mock-token-login' };
    }
  },
  {
    ...prefixEndpointWithMock(EP_USER_REGISTER),
    timeout: 500,
    response({ data }: { data: { email?: string } }) {
      return {
        id: 1,
        role: 1,
        email: data?.email ?? 'test@example.com',
        credential_token: 'mock-token-register',
        email_confirmed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  }
];
