import { prefixEndpointWithMock } from '@config/endpoints/_endpoint';
import { EP_USER_INFO, EP_USER_LOGIN } from '@config/endpoints/user';

export default [
  {
    ...prefixEndpointWithMock(EP_USER_INFO),
    response({ headers }: { headers: Record<string, string> }) {
      if (!headers['Authorization']) {
        return null;
      }

      return {
        id: 1,
        role: 1,
        email: 'test@example.com',
        credential_token: 'mock-credential-token-123456',
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
      return {
        data: { token: 'mock-token-123456' }
      };
    }
  }
];
